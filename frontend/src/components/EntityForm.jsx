function EntityForm({ fields, values, onChange, submitLabel, onSubmit, onCancel, disabled = false }) {
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      {fields.map((field) => {
        const value = values[field.name] ?? '';

        if (field.type === 'select') {
          return (
            <select
              key={field.name}
              value={value}
              onChange={(event) => onChange(field.name, event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required={field.required}
              disabled={disabled}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }

        return (
          <input
            key={field.name}
            value={value}
            onChange={(event) => onChange(field.name, event.target.value)}
            placeholder={field.placeholder}
            type={field.type || 'text'}
            min={field.min}
            minLength={field.minLength}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required={field.required}
            disabled={disabled}
          />
        );
      })}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EntityForm;
