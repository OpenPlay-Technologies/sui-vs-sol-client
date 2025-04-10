import { store } from "./redux/store";


// HTML Canvas element to render to
export const riveCanvas = document.getElementById("rive-canvas") as HTMLCanvasElement | null;

function computeSize() {
    const state = store.getState().rive;
    state.riveInstance?.resizeDrawingSurfaceToCanvas();
}

// Subscribe to window size changes and update call `resizeDrawingSurfaceToCanvas`
window.onresize = computeSize;

// Subscribe to devicePixelRatio changes and call `resizeDrawingSurfaceToCanvas`
window
    .matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    .addEventListener("change", computeSize);

