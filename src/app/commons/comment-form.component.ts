import { Component } from '@angular/core';

@Component({
    selector: 'app-comment-form',
    standalone: true,
    template: `
        <form autocomplete="off" name="comment-form" method="post" data-netlify-honeypot="bot-field" data-netlify="true">
            <input type="text" name="bot-field" style="display:none" aria-label="Don't fill this out if you are breathing" />
            <input
                type="text"
                id="name"
                name="name"
                placeholder="Your Name"
                required
            />
            <textarea
                id="comment"
                name="comment"
                placeholder="Write your comment here..."
                required
            ></textarea>
            <div class="checkbox-wrapper">
                <input
                    type="checkbox"
                    id="gdpr"
                    name="gdpr"
                    value="checkedGdpr"
                    required
                ><label for="gdpr">I agree that my name will be stored in connection with my comment and will be visible to others after a review. To change/delete the comment later please contact me via mail at info [at] ngehlert.de</label>
            </div>
            <button type="submit" class="button" role="button">Submit</button>
        </form>
    `,
    styles: `
        form {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 2em;
        }

        textarea,
        input[type="text"] {
            border: 1px solid var(--light-color);
            padding: 1em;
            border-radius: 0.5em;
            color: var(--alternative-base-color);

            &:focus {
                outline: 1px solid var(--base-app-color);
                box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
            }
        }
        input[type="text"] {
            width: 240px;
        }
        textarea {
            width: 80%;
            min-height: 120px;
        }

        input[type="checkbox"] {
            -webkit-appearance: none;
            appearance: none;
            background-color: var(--form-background);
            margin: 0;

            font: inherit;
            color: currentColor;
            width: 24px;
            height: 24px;
            border: 0.15em solid currentColor;
            border-radius: 0.15em;
            transform: translateY(-0.075em);

            display: grid;
            place-content: center;
        }

        input[type="checkbox"]::before {
            content: "";
            width: 1em;
            height: 1em;
            clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
            transform: scale(0);
            transform-origin: bottom left;
            transition: 120ms transform ease-in-out;
            box-shadow: inset 1em 1em var(--base-app-color);

            background-color: CanvasText;
        }

        input[type="checkbox"]:checked::before {
            transform: scale(1);
        }

        input[type="checkbox"]:focus {
            outline: max(2px, 0.15em) solid var(--base-app-color);
            outline-offset: max(2px, 0.15em);
        }

        .checkbox-wrapper {
            display: grid;
            gap: 12px;
            grid-template-columns: auto 1fr;
            align-items: center;
        }

        label {
            cursor: pointer;
        }

        .button {
            background-color: #fff;
            background-image: none;
            background-position: 0 90%;
            background-repeat: repeat no-repeat;
            background-size: 4px 3px;
            border-style: solid;
            border-width: 2px;
            box-shadow: rgba(0, 0, 0, .2) 15px 28px 25px -18px;
            box-sizing: border-box;
            color: #41403e;
            cursor: pointer;
            display: inline-block;
            font-family: Neucha, sans-serif;
            font-size: 1rem;
            line-height: 23px;
            outline: none;
            padding: .75rem;
            text-decoration: none;
            transition: all 235ms ease-in-out;
            border-bottom-left-radius: 15px 255px;
            border-bottom-right-radius: 225px 15px;
            border-top-left-radius: 255px 15px;
            border-top-right-radius: 15px 225px;
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation;

            &:hover {
                box-shadow: rgba(0, 0, 0, .3) 2px 8px 8px -5px;
                transform: translate3d(0, 2px, 0);
            }

            &:focus {
                box-shadow: rgba(0, 0, 0, .3) 2px 8px 4px -6px;
            }

            &:active {
                background-color: var(--base-app-color-20);
            }
        }

    `,
})
export class CommentFormComponent {

}

