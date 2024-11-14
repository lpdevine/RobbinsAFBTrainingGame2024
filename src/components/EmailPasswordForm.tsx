// EmailPasswordForm.tsx

import ErrorMessage from "./ErrorMessage";
import React from "react";

interface Props {
  formType: 'login' | 'signup' | 'forgotpassword';
  title: string;
  showError: boolean;
  errorMessage: string;
  formData: {
    email: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    squadron?: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function EmailPasswordForm(props: Props) {
  const { formType } = props;

  return (
    <>
      {props.showError && <ErrorMessage message={props.errorMessage} />}
      <div className="form-container">
        <form onSubmit={props.onSubmit}>
          <h2 className="form-title">{props.title}</h2>
          {formType === 'signup' && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name:</label>
                <input
                  className="form-input"
                  placeholder="First Name"
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={props.formData.firstName || ''}
                  onChange={props.onInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name:</label>
                <input
                  className="form-input"
                  placeholder="Last Name"
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={props.formData.lastName || ''}
                  onChange={props.onInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="squadron">Squadron:</label>
                <select
                  className="form-select"
                  id="squadron"
                  name="squadron"
                  value={props.formData.squadron || ''}
                  onChange={props.onInputChange}
                  required
                >
                  <option value="" disabled hidden>
                    Select Squadron
                  </option>
                  <option value="577">577</option>
                  <option value="578">578</option>
                  <option value="579">579</option>
                  <option value="581">581</option>
                  <option value="582">582</option>
                  <option value="402 SWEG">402 SWEG</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              className="form-input"
              placeholder="Email"
              type="email"
              id="email"
              name="email"
              value={props.formData.email || ''}
              onChange={props.onInputChange}
              required
            />
          </div>
          {(formType === 'signup' || formType === 'login') && (
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                className="form-input"
                placeholder="Password"
                type="password"
                id="password"
                name="password"
                value={props.formData.password || ''}
                onChange={props.onInputChange}
                required
              />
            </div>
          )}
          {formType === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                className="form-input"
                placeholder="Confirm Password"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={props.formData.confirmPassword || ''}
                onChange={props.onInputChange}
                required
              />
            </div>
          )}
          <button className="form-submit-button" type="submit">
            Submit
          </button>
        </form>
      </div>
    </>
  );
}

export default EmailPasswordForm;
