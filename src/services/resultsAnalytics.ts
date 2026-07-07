import type { Game } from '../types/game'
import type { Player } from '../types/player'
import type { ScoreHistoryEntry } from '../types/session'

export interface StatTile {
  icon: string
  label: string
  value: string
}

export interface FunFact {
  icon: string
  text: string
}

function findQuestionMeta(game: Game | null, questionId: string) {
  for (const category of game?.categories ?? []) {
    const question = category.questions.find((q) => q.id === questionId)
    if (question) return { title: question.text || 'вопрос', category: category.title, cost: question.cost, isBonus: question.settings.isBonus }
  }
  return null
}

function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  if (min === 0) return `${sec} сек`
  return `${min} мин ${sec} сек`
}

export function analyzeSession(players: Player[], entriesInput: ScoreHistoryEntry[], game: Game | null) {
  const ranked = [...players].sort((a, b) => b.score - a.score)
  const entries = [...entriesInput].sort((a, b) => a.timestamp - b.timestamp)
  const name = (id: string) => players.find((p) => p.id === id)?.name ?? '?'

  const totalQuestions = game?.categories.flatMap((c) => c.questions).length ?? 0
  const answeredCount = new Set(entries.map((e) => e.questionId)).size
  const correct = entries.filter((e) => e.reason === 'correct')
  const incorrect = entries.filter((e) => e.reason === 'incorrect')
  const durationMs = entries.length ? entries[entries.length - 1].timestamp - entries[0].timestamp : 0

  const stats: StatTile[] = [
    { icon: '📋', label: 'Отвечено вопросов', value: `${answeredCount} / ${totalQuestions}` },
    { icon: '✅', label: 'Верных ответов', value: String(correct.length) },
    { icon: '❌', label: 'Неверных ответов', value: String(incorrect.length) },
    { icon: '⏱️', label: 'Длительность игры', value: entries.length ? formatDuration(durationMs) : '—' },
  ]

  const funFacts: FunFact[] = []

  if (ranked[0]) {
    funFacts.push({ icon: '🏆', text: `${ranked[0].name} — чемпион игры с ${ranked[0].score} очками!` })
  }
  if (ranked.length >= 2 && ranked[0].score === ranked[1].score) {
    funFacts.push({ icon: '🤝', text: `${ranked[0].name} и ${ranked[1].name} финишировали в ничью — ${ranked[0].score} очков на двоих лидеров!` })
  }

  // first blood
  const firstCorrect = entries.find((e) => e.reason === 'correct')
  if (firstCorrect) {
    const meta = findQuestionMeta(game, firstCorrect.questionId)
    funFacts.push({
      icon: '🩸',
      text: meta
        ? `Первая кровь: ${name(firstCorrect.playerId)} открыл счёт игры на «${meta.title}» (${meta.category})`
        : `Первая кровь: ${name(firstCorrect.playerId)} первым распечатал счёт игры`,
    })
  }

  // streak analysis (replay chronologically, mirrors historyStore.record logic)
  const streakNow = new Map<string, number>()
  const maxStreak = new Map<string, number>()
  for (const e of entries) {
    if (e.reason === 'correct') {
      const next = (streakNow.get(e.playerId) ?? 0) + 1
      streakNow.set(e.playerId, next)
      maxStreak.set(e.playerId, Math.max(maxStreak.get(e.playerId) ?? 0, next))
    } else if (e.reason === 'incorrect') {
      streakNow.set(e.playerId, 0)
    }
  }
  let bestStreakPlayer: string | null = null
  let bestStreakValue = 0
  for (const [playerId, value] of maxStreak) {
    if (value > bestStreakValue) {
      bestStreakValue = value
      bestStreakPlayer = playerId
    }
  }
  if (bestStreakPlayer && bestStreakValue >= 2) {
    funFacts.push({ icon: '🔥', text: `${name(bestStreakPlayer)} набрал огненную серию из ${bestStreakValue} верных ответов подряд` })
  }

  // biggest win / loss
  const positive = entries.filter((e) => e.delta > 0)
  const negative = entries.filter((e) => e.delta < 0)
  const biggestWin = positive.reduce<ScoreHistoryEntry | null>((best, e) => (!best || e.delta > best.delta ? e : best), null)
  const biggestLoss = negative.reduce<ScoreHistoryEntry | null>((worst, e) => (!worst || e.delta < worst.delta ? e : worst), null)
  if (biggestWin) {
    const meta = findQuestionMeta(game, biggestWin.questionId)
    funFacts.push({
      icon: '💰',
      text: meta
        ? `Крупнейший куш: ${name(biggestWin.playerId)} получил +${biggestWin.delta} за «${meta.title}» (${meta.category})`
        : `Крупнейший куш: ${name(biggestWin.playerId)} получил +${biggestWin.delta} за один вопрос`,
    })
  }
  if (biggestLoss) {
    const meta = findQuestionMeta(game, biggestLoss.questionId)
    funFacts.push({
      icon: '💀',
      text: meta
        ? `Больнее всего: ${name(biggestLoss.playerId)} потерял ${biggestLoss.delta} на «${meta.title}» (${meta.category})`
        : `Больнее всего: ${name(biggestLoss.playerId)} потерял ${biggestLoss.delta} очков за один вопрос`,
    })
  }

  // group entries by question — a question can carry several incorrect attempts (different players) plus one correct
  const byQuestion = new Map<string, ScoreHistoryEntry[]>()
  for (const e of entries) {
    const arr = byQuestion.get(e.questionId) ?? []
    arr.push(e)
    byQuestion.set(e.questionId, arr)
  }

  // grand theft — a player answered correctly right after someone else already missed the same question
  let bestSteal: { thief: string; victims: string[]; cost: number; questionId: string } | null = null
  for (const [questionId, group] of byQuestion) {
    const correctEntry = group.find((e) => e.reason === 'correct')
    if (!correctEntry) continue
    const priorMisses = group.filter(
      (e) => e.reason === 'incorrect' && e.timestamp < correctEntry.timestamp && e.playerId !== correctEntry.playerId
    )
    if (priorMisses.length === 0) continue
    const cost = findQuestionMeta(game, questionId)?.cost ?? 0
    if (!bestSteal || cost > bestSteal.cost) {
      bestSteal = { thief: correctEntry.playerId, victims: [...new Set(priorMisses.map((e) => e.playerId))], cost, questionId }
    }
  }
  if (bestSteal) {
    const meta = findQuestionMeta(game, bestSteal.questionId)
    const victimNames = bestSteal.victims.map(name).join(' и ')
    funFacts.push({
      icon: '🕵️',
      text: meta
        ? `Кража века: ${name(bestSteal.thief)} перехватил «${meta.title}» (${meta.category}) после промаха ${victimNames}`
        : `Кража века: ${name(bestSteal.thief)} перехватил вопрос сразу после чужого промаха`,
    })
  }

  // nemesis rivalry — a pair of players who kept clashing on the same questions
  const pairClashes = new Map<string, { a: string; b: string; count: number }>()
  for (const group of byQuestion.values()) {
    const uniquePlayers = [...new Set(group.map((e) => e.playerId))]
    for (let i = 0; i < uniquePlayers.length; i++) {
      for (let j = i + 1; j < uniquePlayers.length; j++) {
        const key = [uniquePlayers[i], uniquePlayers[j]].sort().join('|')
        const cur = pairClashes.get(key) ?? { a: uniquePlayers[i], b: uniquePlayers[j], count: 0 }
        cur.count += 1
        pairClashes.set(key, cur)
      }
    }
  }
  let nemesisPair: { a: string; b: string; count: number } | null = null
  for (const pair of pairClashes.values()) {
    if (!nemesisPair || pair.count > nemesisPair.count) nemesisPair = pair
  }
  if (nemesisPair && nemesisPair.count >= 2) {
    funFacts.push({
      icon: '🥊',
      text: `${name(nemesisPair.a)} и ${name(nemesisPair.b)} — заклятые соперники: скрещивали шпаги на одних и тех же вопросах ${nemesisPair.count} раза`,
    })
  }

  // hardest question — most incorrect attempts on a single question
  const incorrectByQuestion = new Map<string, number>()
  for (const e of entries) {
    if (e.reason !== 'incorrect') continue
    incorrectByQuestion.set(e.questionId, (incorrectByQuestion.get(e.questionId) ?? 0) + 1)
  }
  let hardestQuestionId: string | null = null
  let hardestQuestionMisses = 0
  for (const [questionId, misses] of incorrectByQuestion) {
    if (misses > hardestQuestionMisses) {
      hardestQuestionMisses = misses
      hardestQuestionId = questionId
    }
  }
  if (hardestQuestionId && hardestQuestionMisses >= 2) {
    const meta = findQuestionMeta(game, hardestQuestionId)
    funFacts.push({
      icon: '🧨',
      text: meta
        ? `Вопрос-мясорубка: «${meta.title}» (${meta.category}) обломал зубы ${hardestQuestionMisses} игрокам подряд`
        : `Один вопрос обломал зубы ${hardestQuestionMisses} игрокам подряд — настоящая мясорубка`,
    })
  }

  // category domination — single player swept all correct answers in a category
  const categoryOf = new Map<string, string>()
  for (const c of game?.categories ?? []) for (const q of c.questions) categoryOf.set(q.id, c.title)
  const categoryCorrectByPlayer = new Map<string, Map<string, number>>()
  for (const e of entries) {
    if (e.reason !== 'correct') continue
    const cat = categoryOf.get(e.questionId)
    if (!cat) continue
    const perPlayer = categoryCorrectByPlayer.get(cat) ?? new Map<string, number>()
    perPlayer.set(e.playerId, (perPlayer.get(e.playerId) ?? 0) + 1)
    categoryCorrectByPlayer.set(cat, perPlayer)
  }
  let dominatedCategory: string | null = null
  let dominator: string | null = null
  let dominatorCount = 0
  for (const [cat, perPlayer] of categoryCorrectByPlayer) {
    if (perPlayer.size !== 1) continue
    const [[playerId, count]] = perPlayer
    if (count >= 2 && count > dominatorCount) {
      dominatedCategory = cat
      dominator = playerId
      dominatorCount = count
    }
  }
  if (dominator && dominatedCategory) {
    funFacts.push({
      icon: '👑',
      text: `${name(dominator)} монополизировал категорию «${dominatedCategory}»: забрал там все ${dominatorCount} вопроса в одиночку, никого не подпустив`,
    })
  }

  // jack of all trades — correct answers spread across the most distinct categories
  const categoriesByPlayer = new Map<string, Set<string>>()
  for (const [cat, perPlayer] of categoryCorrectByPlayer) {
    for (const playerId of perPlayer.keys()) {
      const set = categoriesByPlayer.get(playerId) ?? new Set<string>()
      set.add(cat)
      categoriesByPlayer.set(playerId, set)
    }
  }
  const totalCategories = game?.categories.length ?? 0
  let jackOfAllTrades: { id: string; count: number } | null = null
  for (const [playerId, set] of categoriesByPlayer) {
    if (!jackOfAllTrades || set.size > jackOfAllTrades.count) jackOfAllTrades = { id: playerId, count: set.size }
  }
  if (jackOfAllTrades && totalCategories >= 3 && jackOfAllTrades.count >= 3) {
    funFacts.push({
      icon: '🧭',
      text: `${name(jackOfAllTrades.id)} — универсал вечера: набирал очки в ${jackOfAllTrades.count} из ${totalCategories} категорий`,
    })
  }

  // one-trick pony — opposite of jack of all trades: all correct answers came from a single category
  if (totalCategories >= 3) {
    for (const [playerId, cats] of categoriesByPlayer) {
      if (cats.size !== 1) continue
      const cat = [...cats][0]
      const correctCount = categoryCorrectByPlayer.get(cat)?.get(playerId) ?? 0
      if (correctCount >= 2) {
        funFacts.push({
          icon: '🔒',
          text: `${name(playerId)} — однолюб: все свои очки взял только в категории «${cat}», остальные не тронул`,
        })
        break
      }
    }
  }

  // bonus hunter — most points claimed from bonus questions
  const bonusByPlayer = new Map<string, number>()
  for (const e of entries) {
    if (e.reason !== 'correct') continue
    const meta = findQuestionMeta(game, e.questionId)
    if (!meta?.isBonus) continue
    bonusByPlayer.set(e.playerId, (bonusByPlayer.get(e.playerId) ?? 0) + 1)
  }
  let bonusHunter: { id: string; count: number } | null = null
  for (const [id, count] of bonusByPlayer) {
    if (!bonusHunter || count > bonusHunter.count) bonusHunter = { id, count }
  }
  if (bonusHunter && bonusHunter.count >= 1) {
    funFacts.push({
      icon: '🎁',
      text: `${name(bonusHunter.id)} собрал больше всех бонусных вопросов — ${bonusHunter.count} шт., жадность двигатель прогресса`,
    })
  }

  // high roller / bargain hunter — average cost of correct answers
  const costByPlayer = new Map<string, { sum: number; count: number }>()
  for (const e of entries) {
    if (e.reason !== 'correct') continue
    const meta = findQuestionMeta(game, e.questionId)
    if (!meta) continue
    const stat = costByPlayer.get(e.playerId) ?? { sum: 0, count: 0 }
    stat.sum += meta.cost
    stat.count += 1
    costByPlayer.set(e.playerId, stat)
  }
  let highRoller: { id: string; avg: number } | null = null
  let bargainHunter: { id: string; avg: number } | null = null
  for (const [id, stat] of costByPlayer) {
    if (stat.count < 2) continue
    const avg = stat.sum / stat.count
    if (!highRoller || avg > highRoller.avg) highRoller = { id, avg }
    if (!bargainHunter || avg < bargainHunter.avg) bargainHunter = { id, avg }
  }
  if (highRoller) {
    funFacts.push({
      icon: '💎',
      text: `${name(highRoller.id)} играл по-крупному: средняя цена его верных ответов — ${Math.round(highRoller.avg)} очков`,
    })
  }
  if (bargainHunter && bargainHunter.id !== highRoller?.id) {
    funFacts.push({
      icon: '🪙',
      text: `${name(bargainHunter.id)} насобирал очков по мелочи: средняя цена его верных ответов — всего ${Math.round(bargainHunter.avg)}`,
    })
  }

  // accuracy (снайпер / мимо кассы)
  const accuracy = new Map<string, { correct: number; total: number }>()
  for (const e of entries) {
    if (e.reason === 'correct' || e.reason === 'incorrect') {
      const stat = accuracy.get(e.playerId) ?? { correct: 0, total: 0 }
      stat.total += 1
      if (e.reason === 'correct') stat.correct += 1
      accuracy.set(e.playerId, stat)
    }
  }
  let sniper: { id: string; ratio: number; stat: { correct: number; total: number } } | null = null
  let misser: { id: string; ratio: number; stat: { correct: number; total: number } } | null = null
  for (const [id, stat] of accuracy) {
    if (stat.total < 2) continue
    const ratio = stat.correct / stat.total
    if (!sniper || ratio > sniper.ratio) sniper = { id, ratio, stat }
    if (!misser || ratio < misser.ratio) misser = { id, ratio, stat }
  }

  // efficiency king — best final score per graded attempt (rewards accuracy AND penalizes misses, unlike high roller/bargain hunter which only look at the cost of hits)
  let efficiencyKing: { id: string; value: number } | null = null
  for (const [id, stat] of accuracy) {
    if (stat.total < 2) continue
    const player = players.find((p) => p.id === id)
    if (!player) continue
    const value = player.score / stat.total
    if (!efficiencyKing || value > efficiencyKing.value) efficiencyKing = { id, value }
  }
  if (efficiencyKing && efficiencyKing.value > 0) {
    funFacts.push({
      icon: '🥷',
      text: `${name(efficiencyKing.id)} — эталон эффективности: в среднем ${Math.round(efficiencyKing.value)} очков за каждую попытку ответить`,
    })
  }
  if (sniper && sniper.ratio >= 0.7) {
    funFacts.push({
      icon: '🎯',
      text: `${name(sniper.id)} — снайпер игры: ${Math.round(sniper.ratio * 100)}% точных ответов (${sniper.stat.correct}/${sniper.stat.total})`,
    })
  }
  if (misser && misser.ratio <= 0.3 && misser.id !== sniper?.id) {
    funFacts.push({
      icon: '🙈',
      text: `${name(misser.id)} чаще мазал, чем попадал: всего ${misser.stat.correct}/${misser.stat.total} верных`,
    })
  }
  let perfectPlayer: { id: string; total: number } | null = null
  for (const [id, stat] of accuracy) {
    if (stat.total >= 3 && stat.correct === stat.total) {
      if (!perfectPlayer || stat.total > perfectPlayer.total) perfectPlayer = { id, total: stat.total }
    }
  }
  if (perfectPlayer) {
    funFacts.push({
      icon: '🧊',
      text: `${name(perfectPlayer.id)} — само хладнокровие: ${perfectPlayer.total} из ${perfectPlayer.total} без единой ошибки`,
    })
  }

  // most active
  const activity = new Map<string, number>()
  for (const e of entries) activity.set(e.playerId, (activity.get(e.playerId) ?? 0) + 1)
  let mostActive: string | null = null
  let mostActiveCount = 0
  for (const [id, count] of activity) {
    if (count > mostActiveCount) {
      mostActiveCount = count
      mostActive = id
    }
  }
  if (mostActive && players.length >= 2) {
    funFacts.push({ icon: '⚡', text: `${name(mostActive)} чаще всех оказывался у доски — ${mostActiveCount} отвеченных вопросов` })
  }

  // comeback: leader at the midpoint of the game vs final leader
  if (entries.length >= 4 && players.length >= 2) {
    const midpoint = Math.floor(entries.length / 2)
    const runningScore = new Map<string, number>()
    for (const p of players) runningScore.set(p.id, 0)
    for (let i = 0; i < midpoint; i++) {
      const e = entries[i]
      runningScore.set(e.playerId, (runningScore.get(e.playerId) ?? 0) + e.delta)
    }
    let midLeader: string | null = null
    let midLeaderScore = -Infinity
    for (const [id, score] of runningScore) {
      if (score > midLeaderScore) {
        midLeaderScore = score
        midLeader = id
      }
    }
    if (midLeader && ranked[0] && midLeader !== ranked[0].id) {
      funFacts.push({ icon: '🔄', text: `Камбэк дня: ${ranked[0].name} не лидировал в середине игры, но вырвался вперёд к финалу` })
    }
  }

  // decided on the last question — leader right before the final entry differs from the final champion
  if (entries.length >= 2 && players.length >= 2) {
    const runningScore = new Map<string, number>()
    for (const p of players) runningScore.set(p.id, 0)
    for (let i = 0; i < entries.length - 1; i++) {
      const e = entries[i]
      runningScore.set(e.playerId, (runningScore.get(e.playerId) ?? 0) + e.delta)
    }
    let leaderBeforeLast: string | null = null
    let leaderBeforeLastScore = -Infinity
    for (const [id, score] of runningScore) {
      if (score > leaderBeforeLastScore) {
        leaderBeforeLastScore = score
        leaderBeforeLast = id
      }
    }
    if (leaderBeforeLast && ranked[0] && leaderBeforeLast !== ranked[0].id) {
      funFacts.push({
        icon: '🎬',
        text: `Развязка в последнем вопросе: до финального ответа лидировал ${name(leaderBeforeLast)}, но чемпионом стал ${ranked[0].name}`,
      })
    }
  }

  // rock bottom — a player who dipped into negative score at some point
  if (players.length >= 1) {
    const runningTotal = new Map<string, number>()
    let rockBottomPlayer: string | null = null
    let rockBottomValue = 0
    for (const e of entries) {
      const next = (runningTotal.get(e.playerId) ?? 0) + e.delta
      runningTotal.set(e.playerId, next)
      if (next < rockBottomValue) {
        rockBottomValue = next
        rockBottomPlayer = e.playerId
      }
    }
    if (rockBottomPlayer && rockBottomValue < 0) {
      funFacts.push({
        icon: '📉',
        text: `${name(rockBottomPlayer)} успел уйти в минус до ${rockBottomValue} очков, прежде чем выкарабкаться`,
      })
    }
  }

  // lead changes — how many times the #1 spot changed hands
  if (entries.length >= 2 && players.length >= 2) {
    const runningScore = new Map<string, number>()
    for (const p of players) runningScore.set(p.id, 0)
    let currentLeader: string | null = null
    let leadChanges = 0
    for (const e of entries) {
      runningScore.set(e.playerId, (runningScore.get(e.playerId) ?? 0) + e.delta)
      let candidate: string | null = null
      let candidateScore = -Infinity
      for (const [id, score] of runningScore) {
        if (score > candidateScore) {
          candidateScore = score
          candidate = id
        }
      }
      if (candidate && candidate !== currentLeader && candidateScore > 0) {
        if (currentLeader !== null) leadChanges += 1
        currentLeader = candidate
      }
    }
    if (leadChanges >= 3) {
      funFacts.push({ icon: '🎢', text: `Лидерство переходило из рук в руки ${leadChanges} раз — настоящие эмоциональные качели` })
    }
  }

  // table accuracy — overall correct/incorrect ratio for the whole game
  if (correct.length + incorrect.length >= 3) {
    const tableAccuracy = Math.round((correct.length / (correct.length + incorrect.length)) * 100)
    if (tableAccuracy >= 70) {
      funFacts.push({ icon: '🧠', text: `Сильный стол: за весь вечер игроки отвечали верно в ${tableAccuracy}% случаев` })
    } else if (tableAccuracy <= 40) {
      funFacts.push({ icon: '🎲', text: `Вопросы явно не щадили: верных ответов набралось лишь ${tableAccuracy}% от всех попыток` })
    }
  }

  // point spread — gap between top and bottom of the final standings
  if (ranked.length >= 2) {
    const top = ranked[0].score
    const bottom = ranked[ranked.length - 1].score
    const spread = top - bottom
    if (spread > 0) {
      funFacts.push({
        icon: '📏',
        text: `Разрыв между первым и последним местом — ${spread} очков (${ranked[0].name} vs ${ranked[ranked.length - 1].name})`,
      })
    }
  }

  // most contested category — category where the most distinct players managed to score
  let contestedCategory: string | null = null
  let contestedCount = 0
  for (const [cat, perPlayer] of categoryCorrectByPlayer) {
    if (perPlayer.size > contestedCount) {
      contestedCount = perPlayer.size
      contestedCategory = cat
    }
  }
  if (contestedCategory && contestedCount >= 2) {
    funFacts.push({
      icon: '⚔️',
      text: `Категория «${contestedCategory}» стала полем битвы — очки там урвали сразу ${contestedCount} игрока(ов)`,
    })
  }

  // average stake — typical value of a correct answer across the whole table
  if (correct.length >= 3) {
    let totalCost = 0
    let counted = 0
    for (const e of correct) {
      const meta = findQuestionMeta(game, e.questionId)
      if (!meta) continue
      totalCost += meta.cost
      counted += 1
    }
    if (counted > 0) {
      funFacts.push({
        icon: '🪄',
        text: `Средняя цена верного ответа за игру — ${Math.round(totalCost / counted)} очков`,
      })
    }
  }

  // cost tier accuracy — are cheap questions actually easier than expensive ones?
  const allCosts = (game?.categories.flatMap((c) => c.questions.map((q) => q.cost)) ?? []).sort((a, b) => a - b)
  if (allCosts.length >= 3) {
    const tercile = Math.max(1, Math.floor(allCosts.length / 3))
    const lowMax = allCosts[tercile - 1]
    const highMin = allCosts[allCosts.length - tercile]
    let lowCorrect = 0
    let lowTotal = 0
    let highCorrect = 0
    let highTotal = 0
    for (const e of entries) {
      if (e.reason !== 'correct' && e.reason !== 'incorrect') continue
      const meta = findQuestionMeta(game, e.questionId)
      if (!meta) continue
      if (meta.cost <= lowMax) {
        lowTotal += 1
        if (e.reason === 'correct') lowCorrect += 1
      } else if (meta.cost >= highMin) {
        highTotal += 1
        if (e.reason === 'correct') highCorrect += 1
      }
    }
    if (lowTotal >= 2 && highTotal >= 2) {
      const lowPct = Math.round((lowCorrect / lowTotal) * 100)
      const highPct = Math.round((highCorrect / highTotal) * 100)
      if (lowPct - highPct >= 20) {
        funFacts.push({
          icon: '🪜',
          text: `Чем выше цена, тем больше промахов: дешёвые вопросы брали в ${lowPct}% случаев, а дорогие — лишь в ${highPct}%`,
        })
      } else if (highPct - lowPct >= 20) {
        funFacts.push({
          icon: '🪜',
          text: `Неожиданный расклад: дорогие вопросы брали чаще (${highPct}%), чем дешёвые (${lowPct}%) — простые с виду вопросы оказались с подвохом`,
        })
      }
    }
  }

  // longest pause between two consecutive answers (tension builder)
  let longestGap = 0
  let longestGapEntry: ScoreHistoryEntry | null = null
  for (let i = 1; i < entries.length; i++) {
    const gap = entries[i].timestamp - entries[i - 1].timestamp
    if (gap > longestGap) {
      longestGap = gap
      longestGapEntry = entries[i]
    }
  }
  if (longestGapEntry && longestGap > 30_000) {
    funFacts.push({
      icon: '🥶',
      text: `Самая долгая пауза в игре — ${formatDuration(longestGap)} гробовой тишины перед тем, как ${name(longestGapEntry.playerId)} снова ответил`,
    })
  }

  // manual score corrections
  const manualCount = entries.filter((e) => e.reason === 'manual').length
  if (manualCount > 0) {
    funFacts.push({
      icon: '🎛️',
      text: `Ведущий вручную поправил счёт ${manualCount} раз(а) — не обошлось без ручного управления судьбой`,
    })
  }

  // finish margin — nail-biter vs blowout
  if (ranked.length >= 2 && ranked[0].score !== ranked[1].score) {
    const gap = ranked[0].score - ranked[1].score
    const maxScore = Math.max(1, ranked[0].score)
    const ratio = gap / maxScore
    if (ratio <= 0.1) {
      funFacts.push({ icon: '😬', text: `Финиш на нервах: ${ranked[0].name} обошёл ${ranked[1].name} всего на ${gap} очков` })
    } else if (ratio >= 0.5) {
      funFacts.push({ icon: '🚀', text: `Разгром: ${ranked[0].name} обошёл ${ranked[1].name} на ${gap} очков — остальным оставалось только наблюдать` })
    }
  }

  // final blow — the last correct answer of the game
  const lastCorrect = correct[correct.length - 1]
  if (lastCorrect) {
    const meta = findQuestionMeta(game, lastCorrect.questionId)
    funFacts.push({
      icon: '🏁',
      text: meta
        ? `Последний аккорд игры — верный ответ ${name(lastCorrect.playerId)} на «${meta.title}» (${meta.category})`
        : `Последний аккорд игры остался за ${name(lastCorrect.playerId)}`,
    })
  }

  if (totalQuestions > 0) {
    const percent = Math.round((answeredCount / totalQuestions) * 100)
    funFacts.push({ icon: '📊', text: `Сыграно ${percent}% вопросов доски (${answeredCount} из ${totalQuestions})` })
  }

  return { ranked, stats, funFacts }
}
