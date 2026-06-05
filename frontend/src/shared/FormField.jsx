// Copyright Aravind Adari

const INPUT_CLS =
    "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 " +
    "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/30 " +
    "focus:border-[#D4A017] disabled:bg-gray-50 disabled:text-gray-500 transition-colors";

const LABEL_CLS = "block text-sm font-medium text-gray-700 mb-1";

/**
 * FormField — wrapper that pairs a label with a form control.
 *
 * @param {object} props
 * @param {string} props.label - Label text.
 * @param {boolean} [props.required=false] - Appends a red asterisk when true.
 * @param {string} [props.error] - Validation error message.
 * @param {React.ReactNode} props.children - The input/select/textarea element.
 * @returns {React.ReactElement}
 */
export function FormField({ label, required = false, error, children }) {
    return (
        <div className="mb-4">
            {label && (
                <label className={LABEL_CLS}>
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

/**
 * FormInput — styled text / email / tel / date input.
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string} [props.type="text"]
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {string} [props.placeholder]
 * @param {boolean} [props.required=false]
 * @param {boolean} [props.disabled=false]
 * @returns {React.ReactElement}
 */
export function FormInput({ name, type = "text", value, onChange, placeholder, required = false, disabled = false }) {
    return (
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={INPUT_CLS}
        />
    );
}

/**
 * FormSelect — styled select dropdown.
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {Array<{value: string, label: string}|string>} props.options
 * @param {boolean} [props.required=false]
 * @param {boolean} [props.disabled=false]
 * @returns {React.ReactElement}
 */
export function FormSelect({ name, value, onChange, options = [], required = false, disabled = false }) {
    return (
        <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={INPUT_CLS}
        >
            {options.map((opt) => {
                const val = typeof opt === "string" ? opt : opt.value;
                const label = typeof opt === "string" ? opt : opt.label;
                return <option key={val} value={val}>{label}</option>;
            })}
        </select>
    );
}

/**
 * FormTextarea — styled textarea.
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {string} [props.placeholder]
 * @param {number} [props.rows=4]
 * @param {boolean} [props.required=false]
 * @returns {React.ReactElement}
 */
export function FormTextarea({ name, value, onChange, placeholder, rows = 4, required = false }) {
    return (
        <textarea
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className={INPUT_CLS + " resize-y"}
        />
    );
}
