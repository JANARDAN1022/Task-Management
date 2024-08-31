import React from 'react';

interface OTPInputProps {
  otp: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;  // Added onPaste prop
  disabled:boolean
}

const OTPInput = ({ otp, onChange, onKeyDown, onPaste,disabled }: OTPInputProps) => {
  return (
    <div className="flex space-x-2">
      {otp.map((digit, index) => (
        <input
        disabled={disabled}
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(e, index)}
          onKeyDown={(e) => onKeyDown(e, index)}
          onPaste={onPaste}  // Handle paste event
          className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      ))}
    </div>
  );
};

export default OTPInput;
