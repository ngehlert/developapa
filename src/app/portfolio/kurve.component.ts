import { Component, ElementRef, OnInit, Signal, viewChild } from '@angular/core';
import { Config } from '../kurve/src/config';
import { initGame } from '../kurve/src/index-ssr';

@Component({
    selector: 'kurve',
    template: `
        <section #section oncontextmenu="return false;" class='flex-container'>
            <canvas id="canvas" #canvas></canvas>
        </section>
    `,
    styles: `
        :host {
            height: calc(100% - 2rem);
            width: calc(100% - 4rem);
            position: absolute;
        }

        .flex-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        #canvas {
            background-color: #000000;
        }
    `,
    standalone: true,
    imports: [
    ],
})
class KurveComponent implements OnInit {
    public container: Signal<ElementRef> = viewChild.required('section');
    public canvas: Signal<any> = viewChild.required('canvas');

    public ngOnInit(): void {
        Config.customCanvasWidth = this.container().nativeElement.clientWidth;
        Config.customCanvasHeight = this.container().nativeElement.clientHeight;
        window.IS_ELECTRON_BUILD = false;
        initGame();
    }
}

export { KurveComponent };
