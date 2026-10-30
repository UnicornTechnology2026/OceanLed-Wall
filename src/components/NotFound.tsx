import notFoundAnimation from "../assets/not-found.gif";
import { pageHref } from "../router";

export default function NotFound() {
  return (
    <section
      className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fefefe] px-4 py-10 text-center"
      aria-labelledby="not-found-title"
    >
      <img
        src={notFoundAnimation}
        alt="404 – a lost caveman"
        width={760}
        height={400}
        className="h-auto w-full max-w-190 select-none"
        draggable={false}
      />
      <h1
        id="not-found-title"
        className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl"
      >
        Looks like you&apos;re lost
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600 sm:text-base">
        The page you are looking for is not available.
      </p>
      <a href={pageHref("home")} className="btn btn-primary mt-8">
        Go to Home
      </a>
    </section>
  );
}
