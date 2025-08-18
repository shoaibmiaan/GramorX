import React from "react";
import { Container } from "@/components/design-system/Container";
import { Card } from "@/components/design-system/Card";
import { GradientText } from "@/components/design-system/GradientText";

const faqs = [
  {
    q: "What is GramorX?",
    a: "GramorX is an advanced IELTS preparation portal with AI-driven feedback and practice modules for Listening, Reading, Writing, and Speaking."
  },
  {
    q: "Is the platform free to use?",
    a: "You can start with our free tier (Compass 🧭) which includes limited IELTS modules, quizzes, and basic AI feedback. For full features, upgrade to a paid plan."
  },
  {
    q: "How does AI feedback work?",
    a: "Our AI evaluates your answers (speaking, writing, listening, reading) against IELTS criteria and provides instant scoring plus suggestions for improvement."
  },
  {
    q: "Can I track my progress?",
    a: "Yes, your study plan, completed tasks, band progression, and analytics are tracked in your personalized dashboard."
  },
  {
    q: "Do you support both Academic and General IELTS?",
    a: "Yes, we provide modules, tests, and practice for both Academic and General Training IELTS."
  }
];

export default function FAQ() {
  return (
    <>
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <h1 className="font-slab text-display mb-4">
            <GradientText>Frequently Asked Questions</GradientText>
          </h1>
          <p className="text-grayish max-w-2xl mb-10">
            Common questions about using GramorX and how it helps you prepare for IELTS.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((item, i) => (
              <Card key={i} className="p-6 card-surface rounded-ds-2xl">
                <h3 className="font-semibold text-h3 mb-2">{item.q}</h3>
                <p className="text-body opacity-90">{item.a}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
