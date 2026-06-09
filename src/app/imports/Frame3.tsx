import svgPaths from "./svg-wfle1t4tmv";

function Layer2() {
  return (
    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 830 1315">
      <g id="layer2">
        <path d={svgPaths.p1dfab9c0} fill="var(--fill-0, black)" id="rect3134" />
        <path d={svgPaths.p22461700} fill="var(--fill-0, white)" id="rect56" />
      </g>
    </svg>
  );
}

function WhitePixelMouseCursorArowFixed1() {
  return (
    <div className="h-[1314.17px] overflow-clip relative shrink-0 w-[830px]" data-name="White-Pixel-Mouse-Cursor-Arow-Fixed 1">
      <Layer2 />
    </div>
  );
}

function G5252() {
  return (
    <div className="absolute inset-[2.23%_2.29%_2.9%_2.85%]" data-name="g5252">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 880 992">
        <g id="g5252">
          <path d={svgPaths.p32f42400} fill="var(--fill-0, white)" id="path5216" />
          <path d={svgPaths.p2d06de70} fill="var(--fill-0, black)" id="path5226" />
        </g>
      </svg>
    </div>
  );
}

function Layer1() {
  return (
    <div className="absolute contents inset-[2.23%_2.29%_2.9%_2.85%]" data-name="layer1">
      <G5252 />
    </div>
  );
}

function MousePointerFist1() {
  return (
    <div className="h-[1045.4px] overflow-clip relative shrink-0 w-[927.62px]" data-name="mouse-pointer-fist 1">
      <Layer1 />
    </div>
  );
}

function G1563() {
  return (
    <div className="absolute bottom-[0.03%] left-0 right-0 top-[-0.04%]" data-name="g1563">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1013 1313">
        <g id="g1563">
          <path d={svgPaths.p39d37792} fill="var(--fill-0, #FEFEFE)" id="path1565" />
          <path d={svgPaths.p38c6e880} fill="var(--fill-0, black)" id="path1567" />
        </g>
      </svg>
    </div>
  );
}

function Layer3() {
  return (
    <div className="absolute bottom-[0.03%] contents left-0 right-0 top-[-0.04%]" data-name="layer1">
      <G1563 />
    </div>
  );
}

function Component13021182101() {
  return (
    <div className="h-[1312.58px] overflow-clip relative shrink-0 w-[1012.98px]" data-name="1302118210 1">
      <Layer3 />
    </div>
  );
}

export default function Frame3() {
  return (
    <div className="content-stretch flex gap-[578px] items-center justify-start relative size-full">
      <WhitePixelMouseCursorArowFixed1 />
      <MousePointerFist1 />
      <Component13021182101 />
    </div>
  );
}

// Export individual cursor components
export { WhitePixelMouseCursorArowFixed1, MousePointerFist1, Component13021182101 };