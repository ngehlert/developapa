import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'impressum-component',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section>
            <h2>Impressum</h2>

            <p>
                Nicolas Gehlert<br />
                Freiburg im Breisgau, Germany<br />
            </p>

            <p>Email: info&#64;ngehlert.de</p>

            <p>Responsible for Content: Nicolas Gehlert</p>

            <p>Website Hosting: https://www.netlify.com</p>

            <h3>Disclaimer:</h3>

            <p>
                The content on this blog is for informational and educational purposes only. I make no warranties about
                the accuracy, completeness, or suitability of the information provided. Use of this blog is at your own
                risk. I am not responsible for the content of external websites linked from this blog.
            </p>

            <h3>Data Protection Information:</h3>

            <p>
                This blog collects minimal personal data. If you leave a comment, your name (or alias) and comment
                content will be stored. No other personal data is collected. Please see my
                <a routerLink="/privacy-policy">Privacy Policy</a> for full details. This blog does not use cookies.
            </p>
        </section>
    `,
    styles: `
        section {
            max-width: var(--content-width);
            margin: 1rem auto;
        }
    `,
    imports: [RouterLink],
})
export class ImpressumComponent {}
