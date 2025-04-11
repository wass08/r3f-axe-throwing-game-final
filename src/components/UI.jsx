import { useGame } from "../hooks/useGame";

export const UI = () => {
  const startGame = useGame((state) => state.startGame);
  const balloonsHit = useGame((state) => state.balloonsHit);
  const targetHit = useGame((state) => state.targetHit);
  const throws = useGame((state) => state.throws);
  const firstGame = useGame((state) => state.firstGame);
  return (
    <section className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="absolute top-4 left-4 md:top-8 md:left-14 opacity-0 animate-fade-in-down animation-delay-200 pointer-events-auto">
        <a href="https://wawasensei.dev" target="_blank">
          <img
            src="/images/wawasensei-white.png"
            alt="Wawa Sensei logo"
            className="w-20 h-20 object-contain"
          />
        </a>
      </div>
      <div className="absolute left-4 md:left-15 -translate-x-1/2 -rotate-90 flex items-center gap-4 animation-delay-1500 animate-fade-in-down opacity-0">
        <div className="w-20 h-px bg-white/60"></div>
        <p className="text-white/60 text-xs">Break the curse</p>
      </div>

      <div
        className={`p-4 flex flex-col items-center gap-2 md:gap-4 mt-[50vh] animate-fade-in-up opacity-0 animation-delay-1000`}
      >
        {throws === 0 && (
          <>
            <h1 className="bold text-white/80 text-4xl md:text-5xl font-extrabold text-center">
              🪓 Training Center
            </h1>
            <p className="text-white/70 text-sm">
              Become an axe master and break the curse of the temple by
              exploding balloons. 🎈 <br />
            </p>
            <button
              className="bg-white/80 text-black font-bold px-4 py-2 rounded-lg shadow-md hover:bg-white/100 transition duration-200 pointer-events-auto cursor-pointer"
              onClick={startGame}
            >
              Start Game
            </button>
          </>
        )}
      </div>
      <div className="absolute right-4 top-4 flex flex-col items-end justify-center gap-4">
        <div className="flex flex-col items-center gap-2 saturate-0">
          <p className="">
            {Array(throws)
              .fill(0)
              .map((_, index) => (
                <span key={index} className="text-white text-6xl">
                  🪓
                </span>
              ))}
          </p>
        </div>
        {!firstGame && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium text-white">SCORE</p>
              <p className="text-6xl text-white font-bold">
                {balloonsHit * 5 + targetHit * 50}
              </p>
            </div>
            <p className="text-3xl text-white font-bold">🎈 {balloonsHit}</p>
            <p className="text-3xl text-white font-bold">🎯 {targetHit}</p>
          </>
        )}
      </div>
    </section>
  );
};
