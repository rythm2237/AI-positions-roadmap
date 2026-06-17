// src/components/landing/HowItWorksSection.tsx
// Four-step process that explains the platform journey to new visitors.

const steps = [
  {
    number: "01",
    title: "Choose your target AI role",
    description:
      "Browse 10+ AI career paths and select the role that matches your goals, background, and available time.",
  },
  {
    number: "02",
    title: "Follow a structured roadmap",
    description:
      "Work through phase-by-phase lessons built specifically for your chosen role — no guesswork, no filler content.",
  },
  {
    number: "03",
    title: "Build real portfolio projects",
    description:
      "Every roadmap includes hands-on projects you can showcase to employers or clients as proof of your skills.",
  },
  {
    number: "04",
    title: "Track progress and become job-ready",
    description:
      "Monitor your progress, complete quizzes, add personal notes, and finish fully prepared for the job market.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-600">
            From zero to job-ready in four clear steps.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col">
              {/* Connector line (desktop only, not on last item) */}
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-full top-6 hidden w-full -translate-x-1/2 border-t-2 border-dashed border-indigo-200 lg:block"
                  style={{ width: "calc(100% - 3rem)" }}
                />
              )}

              {/* Step number */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-extrabold text-white shadow-sm">
                {step.number}
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
