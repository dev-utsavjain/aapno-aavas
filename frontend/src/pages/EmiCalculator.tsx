import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { Seo } from "@/components/Seo";
import { Reveal } from "@/components/motion/Reveal";
import { calcEmi } from "@/lib/emi";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

function Field({
  label, value, onChange, min, max, step, suffix,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; suffix: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="eyebrow text-ink-muted">{label}</label>
        <span className="font-display font-bold text-navy">
          {label.startsWith("Loan") ? inr(value) : value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-saffron"
      />
    </div>
  );
}

export default function EmiCalculator() {
  const [amount, setAmount] = useState(5_000_000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const months = years * 12;
  const emi = calcEmi(amount, rate, months);
  const totalPayable = emi * months;
  const totalInterest = totalPayable - amount;
  const interestPct = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;

  return (
    <>
      <Seo
        title="Home Loan EMI Calculator"
        description="Estimate your monthly home-loan EMI, total interest and total payable amount. A quick planning tool from Aapno Aavas, Jaipur."
      />

      {/* Header band */}
      <section className="bg-navy-deep text-surface">
        <div className="container-page pt-32 pb-20">
          <Reveal>
            <p className="eyebrow text-saffron mb-4">Tools</p>
            <h1 className="text-surface text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold max-w-3xl">
              Home Loan EMI Calculator
            </h1>
            <p className="mt-6 text-lg text-surface/80 max-w-2xl">
              Estimate your monthly instalment before you commit. Adjust the amount, interest rate
              and tenure to see what fits your budget.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Calculator */}
      <section className="container-page py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20 items-start">
          <Reveal>
            <div className="space-y-9">
              <Field label="Loan amount" value={amount} onChange={setAmount} min={500_000} max={100_000_000} step={100_000} suffix="" />
              <Field label="Interest rate" value={rate} onChange={setRate} min={5} max={15} step={0.05} suffix="% p.a." />
              <Field label="Tenure" value={years} onChange={setYears} min={1} max={30} step={1} suffix=" yrs" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="bg-sand hairline rounded-sm p-8 md:p-10">
              <p className="eyebrow mb-2">Monthly EMI</p>
              <p className="font-display font-bold text-navy text-[clamp(2.5rem,5vw,3.5rem)] leading-none">
                {inr(emi)}
              </p>

              {/* Split bar: principal vs interest */}
              <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-navy/15">
                <div className="h-full bg-saffron" style={{ width: `${interestPct}%` }} />
              </div>
              <div className="mt-3 flex justify-between text-xs text-ink-muted">
                <span>Principal</span>
                <span>Interest {Math.round(interestPct)}%</span>
              </div>

              <dl className="mt-8 space-y-4 text-sm">
                <div className="flex justify-between border-b hairline pb-3">
                  <dt className="text-ink-muted">Principal</dt>
                  <dd className="font-medium text-navy">{inr(amount)}</dd>
                </div>
                <div className="flex justify-between border-b hairline pb-3">
                  <dt className="text-ink-muted">Total interest</dt>
                  <dd className="font-medium text-navy">{inr(totalInterest)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Total payable</dt>
                  <dd className="font-bold text-navy">{inr(totalPayable)}</dd>
                </div>
              </dl>

              <p className="mt-6 text-xs text-ink-muted leading-relaxed">
                Indicative only. Actual EMI depends on the lender's rate, processing fees and terms.
                Verify with your bank before booking.
              </p>

              <Link to="/contact" className="btn-primary mt-7 w-full justify-center">
                Talk to an advisor <ArrowRight size={18} weight="bold" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
