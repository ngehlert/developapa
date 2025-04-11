import {
    Component,
    computed,
    ElementRef, inject,
    input,
    InputSignal,
    model,
    ModelSignal,
    Signal,
    signal,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-select',
    standalone: true,
    template: `
        <section (keydown)="onListItemKeyDown($event)">
            <input
                #textInput
                class="text-input"
                type="text"
                [placeholder]="isFocused() ? 'Type to filter' : placeholder()"
                [(ngModel)]="searchString"
                (focusin)="onFocusIn()"
            />
            @if (isFocused()) {
                <ul class="value-list" #optionList>
                    @for (option of filteredOptions(); track option; let i = $index) {
                        <li
                            tabindex="0"
                            (click)="onSearchChange(option)"
                        >{{ option }}</li>
                    }
                </ul>
            }
        </section>
    `,
    imports: [
        FormsModule,
    ],
    styles: `
        section {
            position: relative;
            height: 100px;
            width: 100%;
            color: var(--alternative-base-color);
        }

        .text-input {
            width: calc(100% - 2em);
            font-weight: 500;
            font-size: 1em;
            padding: 1em;
            background-color: #FAFCFD;
            border: 1px solid var(--base-app-color);
            transition: .3s ease-in-out;

            &::-webkit-input-placeholder {
                color: var(--alternative-base-color);
            }

            &:hover {
                background-color: var(--base-app-color-20);
                cursor: pointer;

                &::-webkit-input-placeholder {
                    color: var(--alternative-base-color);
                }
            }

            &:focus,
            &.open {
                box-shadow: 0px 5px 8px 0px rgba(0, 0, 0, 0.2);
                outline: 0;
                background-color: var(--base-app-color-20);
            }
        }

        .value-list {
            position: absolute;
            top: 3.2em;
            margin: 0;
            left: 0;
            width: 100%;
            list-style: none;
            padding: 0;
            box-shadow: 0px 5px 8px 0px rgba(0, 0, 0, 0.2);
            z-index: 2;
            background: #FAFCFD;
            max-height: 320px;
            overflow: auto;

            li {
                position: relative;
                padding: 1em;
                background-color: #FAFCFD;
                display: flex;
                align-items: center;
                cursor: pointer;
                transition: background-color .3s;
                opacity: 1;

                &:focus,
                &:hover {
                    background-color: var(--base-app-color-20);
                }

                &:focus-visible {
                    outline: none !important;
                }
            }
        }
    `,
})
export class SelectComponent {
    selectedOption: ModelSignal<string | null> = model.required();
    options: InputSignal<string[]> = input.required();
    placeholder: InputSignal<string> = input('Select an option');

    input: Signal<ElementRef> = viewChild.required('textInput');
    optionList: Signal<ElementRef | undefined> = viewChild('optionList');

    filteredOptions: Signal<string[]> = computed(() => {
        return this.options().filter((option) =>
            option.toLowerCase().includes(this.searchString().toLowerCase())
        );
    })

    isFocused: WritableSignal<boolean> = signal(false);
    searchString: WritableSignal<string> = signal('');

    #clickListenerCallback = this.#clickListener.bind(this);
    #elementRef: ElementRef = inject(ElementRef);

    onListItemKeyDown(event: KeyboardEvent) {
        const childList: HTMLElement[] = Array.from(this.optionList()?.nativeElement.children);
        const activeIndex = childList.findIndex((child) => {
            return child === document.activeElement;
        });
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (activeIndex > -1) {
                childList[activeIndex + 1]?.focus();
            } else {
                childList[0]?.focus();
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (activeIndex > -1) {
                childList[activeIndex - 1]?.focus();
            }
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.onSearchChange('');
            this.#unfocus();
        } else if (event.key === 'Enter') {
            if (activeIndex > -1) {
                const activeOption = childList[activeIndex].textContent;
                if (activeOption) {
                    this.onSearchChange(activeOption)
                }
            }
        }
    }

    onFocusIn() {
        this.isFocused.set(true);
        document.addEventListener('click', this.#clickListenerCallback);
    }

    onSearchChange(value: string) {
        this.searchString.set(value);
        if (!value) {
            this.selectedOption.set(null);
            return;
        }
        if (this.options().includes(value)) {
            this.selectedOption.set(value);
            this.#unfocus();
        }
    }

    #unfocus() {
        this.input().nativeElement.blur();
        this.isFocused.set(false);
    }

    #clickListener(event: MouseEvent) {
        if (!this.#elementRef.nativeElement.contains(event.target)) {
            this.#unfocus();
            document.removeEventListener('click', this.#clickListenerCallback);
        }
    }
}
