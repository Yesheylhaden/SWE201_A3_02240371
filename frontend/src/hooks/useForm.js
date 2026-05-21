import { useState } from 'react';

export const useForm = (initialValues = {}, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues({
      ...values,
      [name]: value,
    });
    if (validate && touched[name]) {
      const error = validate(name, value);
      setErrors({
        ...errors,
        [name]: error,
      });
    }
  };

  const handleBlur = (name) => {
    setTouched({
      ...touched,
      [name]: true,
    });
    if (validate) {
      const error = validate(name, values[name]);
      setErrors({
        ...errors,
        [name]: error,
      });
    }
  };

  const setFieldValue = (name, value) => {
    handleChange(name, value);
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    resetForm,
  };
};