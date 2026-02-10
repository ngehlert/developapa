import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Comment } from './comment';
import { SafeHtmlPipe } from './safe-html.pipe';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-comment',
    imports: [SafeHtmlPipe, DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style.--initial-rotate.deg]': 'rotationDegrees()',
    },
    template: `
        <div class="comment-note">
            @if (applyRedPin()) {
                <i class="red-pin"></i>
            }
            @if (applyBluePin()) {
                <i class="blue-pin"></i>
            }
            @if (applyScotchTape()) {
                <div class="scotch-tape"></div>
            }
            <div class="comment-header">
                <strong class="comment-author">{{ commentData().name }}</strong>
                <span class="comment-date">{{ commentData().date | date: 'longDate' }}</span>
            </div>
            <p
                class="comment-message"
                [innerHtml]="commentData().htmlContent | safeHtml"
            ></p>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: 5px;
            --initial-rotate: -1deg;
            transform: rotate(var(--initial-rotate));
            transition:
                transform 0.15s linear,
                box-shadow 0.15s linear;
            margin-bottom: 12px;
        }

        :host(:hover) {
            --hover-rotate: 1deg;
            transform: scale(1.05) rotate(var(--hover-rotate));
            z-index: 10;
            position: relative;
        }

        .comment-note {
            background-color: #ffc;
            padding: 15px;
            min-height: 100px;
            width: 60%;
            box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
            transform: rotate(-1deg);
            transition:
                transform 0.15s linear,
                box-shadow 0.15s linear,
                z-index 0s 0.15s linear;
            word-wrap: break-word;
            position: relative;
        }

        .comment-note:hover {
            box-shadow: 6px 6px 10px rgba(0, 0, 0, 0.4);
        }

        .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
            padding-bottom: 5px;
        }

        .comment-author {
            font-weight: bold;
            color: #333;
        }

        .comment-date {
            font-size: 0.8em;
            color: var(--base-color);
        }

        .comment-message {
            font-size: 0.95em;
            line-height: 1.4;
            color: #222;
            margin: 0;
        }

        .blue-pin,
        .red-pin {
            background-color: #aaa;
            display: block;
            height: 32px;
            width: 2px;
            position: absolute;
            left: 50%;
            top: -8px;
            z-index: 1;
            transform: rotate(5deg);

            &:after {
                background-color: #a31;
                background-image: radial-gradient(25% 25%, circle, hsla(0, 0%, 100%, 0.3), hsla(0, 0%, 0%, 0.3));
                border-radius: 50%;
                box-shadow:
                    inset 0 0 0 1px hsla(0, 0%, 0%, 0.1),
                    inset 3px 3px 3px hsla(0, 0%, 100%, 0.2),
                    inset -3px -3px 3px hsla(0, 0%, 0%, 0.2),
                    23px 20px 3px hsla(0, 0%, 0%, 0.15);
                content: '';
                height: 12px;
                left: -5px;
                position: absolute;
                top: -10px;
                width: 12px;
            }

            &:before {
                background-color: hsla(0, 0%, 0%, 0.1);
                box-shadow: 0 0 0.25em hsla(0, 0%, 0%, 0.1);
                content: '';

                height: 24px;
                width: 2px;
                left: 0;
                position: absolute;
                top: 8px;
                transform: rotate(57.5deg);
                transform-origin: 50% 100%;
            }
        }

        .blue-pin {
            left: 30%;
            transform: rotate(-15deg);

            &:after {
                background-color: #007afc;
                box-shadow:
                    inset 0 0 0 1px hsla(0, 0%, 0%, 0.1),
                    inset 3px 3px 3px hsla(0, 0%, 100%, 0.2),
                    inset -3px -3px 3px hsla(0, 0%, 0%, 0.2),
                    27px 29px 3px hsla(0, 0%, 0%, 0.15);
            }

            &:before {
                transform: rotate(77deg);
            }
        }
        .scotch-tape {
            &:after {
                bottom: 6px;
                background: rgba(255, 255, 235, 0.6);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                content: '';
                display: block;
                height: 30px;
                position: absolute;
                width: 100px;
                left: -35px;
                transform: rotate(55deg);
            }
            &:before {
                top: 10px;
                background: rgba(255, 255, 235, 0.6);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                content: '';
                display: block;
                height: 30px;
                position: absolute;
                width: 100px;
                right: -30px;
                transform: rotate(45deg);
            }
        }
    `,
})
export class CommentComponent {
    commentData = input.required<Comment>();
    index = input<number>(0);

    applyRedPin = computed(() => {
        return this.index() % 4 === 0;
    });

    applyBluePin = computed(() => {
        return this.index() % 4 === 2;
    });

    applyScotchTape = computed(() => {
        return this.index() % 4 === 1;
    });

    rotationDegrees = computed(() => {
        const rotations = [-1, 1, -1, 0];
        return rotations[this.index() % rotations.length] ?? 0;
    });
}
