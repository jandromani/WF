'use client';

import { FormEvent, useState } from 'react';

import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { CreatePostInput } from '@/services/feed';

interface ComposerProps {
  onSubmit: (input: CreatePostInput) => Promise<unknown>;
  disabled?: boolean;
}

export function Composer({ onSubmit, disabled }: ComposerProps) {
  const [content, setContent] = useState('');
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        content: content.trim(),
        price: locked ? 10 : undefined,
      });
      setContent('');
      setLocked(false);
      showToast('Tu post se publicó correctamente', 'success');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
      showToast('No se pudo publicar el post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <textarea
        className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm focus:border-black focus:outline-none"
        placeholder="Comparte una actualización con tus fans..."
        rows={3}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={disabled}
      />
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={locked}
            onChange={(event) => setLocked(event.target.checked)}
            disabled={disabled}
          />
          Contenido premium
        </label>
        <Button type="submit" size="sm" loading={loading} disabled={disabled}>
          Publicar
        </Button>
      </div>
      {disabled ? (
        <p className="mt-2 text-xs text-amber-500">
          Verifica tu World ID para publicar contenido.
        </p>
      ) : null}
    </form>
  );
}
