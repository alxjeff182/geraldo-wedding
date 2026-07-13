import { useCountdown } from "../../hooks/useCountdown";
import { useWeddingContent } from "../../context/WeddingContentContext";

type Props = {
  embedded?: boolean;
};

export function Countdown({ embedded = false }: Props) {
  const { content } = useWeddingContent();
  const { days, hours, minutes, seconds } = useCountdown(content.date);
  const labelList = [
    content.countdown.labels.days,
    content.countdown.labels.hours,
    content.countdown.labels.minutes,
    content.countdown.labels.seconds,
  ];
  const values = [days, hours, minutes, seconds];
  const Wrapper = embedded ? "div" : "section";

  return (
    <Wrapper
      {...(!embedded ? { id: "countdown" } : {})}
      className="section-countdown-wrap section-ulos"
      aria-labelledby="countdown-heading"
    >
      <div className="countdown-inner">
        <div className="countdown-header" aria-hidden>
          <img
            src={content.media.bunga}
            alt=""
            className="countdown-bunga countdown-bunga--left"
            loading="lazy"
            width={180}
            height={192}
          />
          <img
            src={content.media.rumahBolon}
            alt=""
            className="countdown-rumah"
            loading="lazy"
            width={180}
            height={223}
          />
          <img
            src={content.media.bunga}
            alt=""
            className="countdown-bunga countdown-bunga--right"
            loading="lazy"
            width={180}
            height={192}
          />
        </div>

        <p className="countdown-title">{content.countdown.title}</p>
        <h2 id="countdown-heading" className="sr-only">
          {content.countdown.heading}
        </h2>

        <div
          className="countdown-grid"
          role="timer"
          aria-live="polite"
          aria-label={`${days} hari ${hours} jam ${minutes} menit ${seconds} detik`}
        >
          {values.map((value, i) => (
            <div key={labelList[i]} className="countdown-box">
              <span className="countdown-box__digit">{String(value).padStart(2, "0")}</span>
              <span className="countdown-box__label">{labelList[i]}</span>
            </div>
          ))}
        </div>

        <img
          src={content.media.divider}
          alt=""
          className="divider-img relative z-10 mt-8"
          loading="lazy"
          width={320}
          height={74}
        />
      </div>
    </Wrapper>
  );
}
