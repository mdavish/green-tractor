import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <h1 className="text-3xl font-bold">
      Welcome, {firstName}! Are you receiving this email?
    </h1>
  </div>
);
