import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import './FormField.css';

const FormField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  validation = null,
  error: externalError = null,
  showValidation = true,
  ...props
}) => {
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (externalError) {
      setError(externalError);
      setIsValid(false);
    }
  }, [externalError]);

  const validate = (val) => {
    if (!showValidation) return true;

    // Required validation
    if (required && (!val || val.trim() === '')) {
      setError(`${label || name} is required`);
      setIsValid(false);
      return false;
    }

    // Custom validation
    if (validation && val) {
      const validationResult = validation(val);
      if (validationResult !== true) {
        setError(validationResult);
        setIsValid(false);
        return false;
      }
    }

    // Type-specific validation
    if (type === 'email' && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setError('Please enter a valid email address');
        setIsValid(false);
        return false;
      }
    }

    if (type === 'password' && val) {
      if (val.length < 6) {
        setError('Password must be at least 6 characters');
        setIsValid(false);
        return false;
      }
    }

    if (type === 'number' && val) {
      if (isNaN(val)) {
        setError('Please enter a valid number');
        setIsValid(false);
        return false;
      }
    }

    if (type === 'url' && val) {
      try {
        new URL(val);
      } catch {
        setError('Please enter a valid URL');
        setIsValid(false);
        return false;
      }
    }

    setError(null);
    setIsValid(true);
    return true;
  };

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(e);
    if (touched) {
      validate(val);
    }
  };

  const handleBlur = (e) => {
    setTouched(true);
    validate(e.target.value);
    if (onBlur) {
      onBlur(e);
    }
  };

  const getInputClass = () => {
    let className = 'form-input';
    if (touched) {
      if (error) {
        className += ' error';
      } else if (isValid && value) {
        className += ' valid';
      }
    }
    return className;
  };

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={getInputClass()}
          {...props}
        />
        {touched && showValidation && (
          <div className="validation-icon">
            {error ? (
              <FiX className="error-icon" />
            ) : isValid && value ? (
              <FiCheck className="valid-icon" />
            ) : null}
          </div>
        )}
      </div>
      {touched && error && (
        <div className="error-message">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}
      {touched && !error && isValid && value && (
        <div className="success-message">
          <FiCheck />
          <span>Looks good!</span>
        </div>
      )}
    </div>
  );
};

export default FormField;

