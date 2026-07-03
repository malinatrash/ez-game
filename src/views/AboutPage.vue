<script setup lang="ts">
</script>

<template>
  <main class="page">
    <h1>О программе</h1>

    <section>
      <h2>Как это работает</h2>
      <ol>
        <li>Создайте игру и категории с вопросами в редакторе.</li>
        <li>Для каждого вопроса соберите содержимое на холсте: текст, картинки, видео, аудио — можно двигать, вращать, менять размер.</li>
        <li>Нажмите «Играть», добавьте игроков и ведите партию по доске.</li>
        <li>После ответа выставляйте очки — верно/неверно/вручную/никто не ответил.</li>
        <li>Завершите игру и посмотрите итоговую таблицу.</li>
      </ol>
    </section>

    <section>
      <h2>Возможности</h2>
      <ul>
        <li>Полностью локально — все данные хранятся в браузере (IndexedDB), сервер не нужен.</li>
        <li>Экспорт/импорт игр в файл <code>.sog</code> для переноса между устройствами.</li>
        <li>Canvas-редактор вопроса с поддержкой текста, картинок, видео и аудио.</li>
        <li>5 встроенных тем оформления + возможность создать свою.</li>
      </ul>
    </section>

    <section>
      <h2>Версия</h2>
      <p class="muted">Своя игра · локальный конструктор викторин</p>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  text-align: left;
}
h2 {
  margin-bottom: var(--space-2);
}
ol,
ul {
  padding-left: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--color-text);
}
.muted {
  color: var(--color-text-muted);
}
code {
  background: var(--color-surface-raised);
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
}
</style>
