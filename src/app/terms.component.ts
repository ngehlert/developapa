import { Component } from '@angular/core';

@Component({
    selector: 'terms-of-use-component',
    template: `
        <section>
            <h2>Terms of Use</h2>

            <p>Effective Date: 17/09/2025</p>

            <p>
                Welcome to Developapa! By accessing and using this blog (the "Blog"), you agree to be bound by these
                Terms of Use (the "Terms"). If you do not agree to these Terms, please do not use the Blog.
            </p>

            <h3>1. License to Use Content (The "Beerware" Approach):</h3>

            <p>
                I, Nicolas Gehlert, grant you a broad, non-exclusive, royalty-free license to use, copy, modify,
                distribute, and do pretty much anything you want with the content on this Blog (the "Content"),
                including text, code, images, and other materials, subject to the following very simple conditions:
            </p>

            <ul>
                <li>
                    <b>Share Alike (Optional, but Appreciated):</b> If you modify or adapt the Content, I'd appreciate
                    it if you considered sharing your modifications back with the community. This is entirely optional,
                    though!
                </li>
                <li>
                    <b>Attribution (Optional, but Appreciated):</b> Giving credit where credit is due is always a nice
                    gesture. If you use my Content, a simple acknowledgment of the source (e.g., "Based on content from
                    Developapa") would be appreciated. Again, this is optional.
                </li>
            </ul>

            <p>
                Think of it like the Beerware license: If we ever meet, and you think the Content has been useful,
                buying me a beer would be a nice reward, but it's by no means required.
            </p>

            <h3>2. No Warranties (Absolutely None):</h3>

            <p>
                THE CONTENT ON THIS BLOG IS PROVIDED "AS IS" AND WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. I
                DISCLAIM ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
                FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <p>
                I MAKE NO WARRANTY THAT THE CONTENT WILL BE ACCURATE, COMPLETE, RELIABLE, OR ERROR-FREE. YOU USE THE
                CONTENT AT YOUR OWN RISK.
            </p>

            <h3>3. Limitation of Liability:</h3>

            <p>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, I SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF OR
                INABILITY TO USE THE CONTENT, EVEN IF I HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>

            <p>
                THIS INCLUDES, BUT IS NOT LIMITED TO, DAMAGES FOR LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
                INTANGIBLE LOSSES.
            </p>

            <h3>4. User Conduct:</h3>

            <p>
                While I'm granting you broad permissions to use the Content, I expect you to behave responsibly. You
                agree not to use the Blog or the Content for any unlawful or harmful purpose.
            </p>

            <h3>5. Comments:</h3>

            <p>
                If you choose to leave comments on the Blog, you are solely responsible for the content of your
                comments. I reserve the right to moderate and remove comments that are inappropriate, offensive, or
                violate these Terms.
            </p>

            <h3>6. External Links:</h3>

            <p>
                The Blog may contain links to external websites. I am not responsible for the content of those websites.
                Your use of external websites is at your own risk.
            </p>

            <h3>7. Changes to These Terms:</h3>

            <p>
                I reserve the right to modify these Terms at any time. I will post any changes on this page, and the
                effective date will be updated accordingly. Your continued use of the Blog after any such changes
                constitutes your acceptance of the new Terms.
            </p>

            <h3>8. Governing Law:</h3>

            <p>
                These Terms shall be governed by and construed in accordance with the laws of Germany,
                Baden-Württemberg, without regard to its conflict of law principles.
            </p>

            <h3>9. Contact Information:</h3>

            <p>If you have any questions about these Terms, please contact me at: info&#64;ngehlert.de</p>
        </section>
    `,
    standalone: true,
    styles: `
        section {
            max-width: var(--content-width);
            margin: 1rem auto;
        }
    `,
})
class TermsOfUseComponent {}

export { TermsOfUseComponent };
