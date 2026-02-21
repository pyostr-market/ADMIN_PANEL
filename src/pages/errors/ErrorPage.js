export function ErrorPage({ code = '500' }) {
  return (
    <section>
      <h1>Ошибка {code}</h1>
      <p>Публичная страница ошибок.</p>
    </section>
  );
}
