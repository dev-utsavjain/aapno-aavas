import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { Seo } from "@/components/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" noindex />
      <section className="flex min-h-[80vh] items-center bg-bg">
        <div className="container-page">
          <div className="mx-auto max-w-xl text-center">
            <p className="eyebrow text-saffron">Error 404</p>
            <p className="mt-6 font-serif text-[7rem] leading-none text-navy md:text-[9rem]">404</p>
            <h1 className="mt-4 text-3xl text-ink md:text-4xl">This page has moved on</h1>
            <p className="mt-4 leading-relaxed text-ink-muted">
              The page you were looking for isn't here — it may have been relisted, sold, or the
              link may be out of date. Let's get you back to properties that are available in
              Jaipur.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/" className="btn-primary">
                Back to home
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-navy underline-offset-4 hover:underline"
              >
                Browse all properties
                <ArrowRight weight="bold" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
