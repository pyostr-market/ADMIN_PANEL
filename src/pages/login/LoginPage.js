import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../../entities/session/model/SessionProvider';
import { Card } from '../../shared/ui/Card/Card';
import { Button } from '../../shared/ui/Button';
import { LoadingState } from '../../shared/ui/LoadingState/LoadingState';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useSession();
  const [form, setForm] = useState({ username: '9995309522', password: 'string' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from || '/';

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (_error) {
      setError('Не удалось выполнить вход. Проверьте логин и пароль.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return <LoadingState message="Вход в систему..." size="lg" />;
  }

  return (
    <section className="auth-card">
      <Card padding="md">
        <h1>Вход в панель управления</h1>
        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="username">Логин</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={form.username}
            onChange={onChange}
            required
          />

          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={onChange}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            loading={submitting}
            className="auth-form__submit"
          >
            {submitting ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </Card>
    </section>
  );
}
