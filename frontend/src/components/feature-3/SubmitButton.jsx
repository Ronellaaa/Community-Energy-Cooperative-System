import React from 'react';

const SubmitButton = ({ loading, label = 'Submit Meter Reading' }) => {
  return (
    <button
      className="f3mr-submitButton"
      type="submit"
      disabled={loading}
    >
      {loading ? 'Submitting...' : label}
    </button>
  );
};

export default SubmitButton;
