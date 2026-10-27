import { StillHusband } from "./Face";
import { forwardRef } from "react";
import "./sharecard.css";
import { CONFIG, siteHost } from "../../content";
import { useFitText } from "../../hooks/useFitText";
import { Credit } from "./ui";

const A = (f) => `/assets/${f}`;
const STARS = [
  ["gold-star-1.webp", 62, 262, 58, 1], ["gold-star-2.webp", 120, 330, 30, 0.85], ["gold-star-1.webp", 960, 238, 46, 1],
  ["gold-star-2.webp", 66, 1452, 40, 1], ["gold-star-1.webp", 972, 1430, 56, 1], ["gold-star-2.webp", 930, 1480, 26, 0.85],
];

const wovenLines = ([a, b, c]) => [`${a}, ${b},`, `& ${c}`];

export const ShareCard = forwardRef(function ShareCard({ husband, fontsReady, layer = "full", site, credit }, ref) {
  const { name, number, card } = husband;
  const [nameRef] = useFitText([name, fontsReady], { max: 104, min: 40, width: 440 });
  const [strRef] = useFitText([card.line1, card.line2, fontsReady], { max: 20, min: 12, step: 1, width: 400 });
  const [wfRef] = useFitText([card.woven.join(), fontsReady], { max: 29, min: 16, step: 1, width: 524 });
  const [urlRef] = useFitText([fontsReady], { max: 19, min: 11, step: 1, width: 524 });
  const [l1, l2] = wovenLines(card.woven);
  return (
    <div className={`whc layer-${layer}`} ref={ref} data-testid="share-card" style={{ "--sky-img": `url(${A("oval-sky.webp?v=2")})` }}>
      <div className="amb" />
      <div className="amb-sky" />
      <div className="damask" />
      <div className="band top">
        <div className="t-l">Woven</div>
        <img className="t-sun" src={A("gold-sun.webp")} alt="" />
        <div className="t-r">to Order</div>
        <div className="t-sub">Willow &amp; wicker, never jawlines · Miss Austen would approve</div>
      </div>
      <div className="sky"><StillHusband className="sky-husband" /><div className="sky-shade" /></div>
      <div className="frame-wrap"><img className="frame" src={A("frame-gold.webp")} alt="" /></div>
      {STARS.map(([f, l, t, w, o], i) => (
        <img key={i} className="star" src={A(f)} style={{ left: l, top: t, width: w, opacity: o }} alt="" />
      ))}
      <div className="o-meet">Meet</div>
      <div className="o-name dyn" ref={nameRef} data-testid="share-card-name">
        <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{name.toUpperCase()}</span>
      </div>
      <div className="o-rule"><i /><b /><i /></div>
      <div className="o-strands dyn" ref={strRef}>
        <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{card.line1}</span><br />
        <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{card.line2}</span>
      </div>
      <div className="cart">a wicker husband,<br />woven by hand</div>
      <div className="band bot">
        <div className="stat s1"><div className="n">07</div><div className="l">Strands</div></div>
        <img className="scroll" src={A("gold-scroll-left.webp")} style={{ left: 262 }} alt="" />
        <div className="mid"><div className="no">His number</div><div className="big dyn" data-testid="share-card-number">{number.slice(0, 2)}<sup>✦</sup>{number.slice(2)}</div></div>
        <img className="scroll" src={A("gold-scroll-right.webp")} style={{ right: 262 }} alt="" />
        <div className="stat s3"><div className="n">05</div><div className="l">Vows</div></div>
        <div className="hr" />
        <div className="wf-l">Woven from</div>
        <div className="wf-r dyn">
          <p ref={wfRef}>
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{l1}</span><br />
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{l2}</span>
          </p>
          <p ref={urlRef}><span style={{ display: "inline-block", whiteSpace: "nowrap" }}>(Weave yours at {site || siteHost()})</span></p>
        </div>
        <div className="seal"><span>W</span></div>
      </div>
      <div className="credit dyn" style={{ fontSize: 19 }}><Credit text={credit || CONFIG.CARD_CREDIT_LINE} /></div>
      <div className="grain" />
      <div className="vig" />
    </div>
  );
});
