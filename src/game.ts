import { GlobalStorage } from "./components/global-storage";


// HTML Canvas element to render to
export const riveCanvas = document.getElementById("rive-canvas") as HTMLCanvasElement | null;

function computeSize() {
    GlobalStorage.instance.data?.riveInstance?.resizeDrawingSurfaceToCanvas();
}

// Subscribe to window size changes and update call `resizeDrawingSurfaceToCanvas`
window.onresize = computeSize;

// Subscribe to devicePixelRatio changes and call `resizeDrawingSurfaceToCanvas`
window
    .matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    .addEventListener("change", computeSize);

