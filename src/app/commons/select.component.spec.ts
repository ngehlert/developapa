import { vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection, Component } from '@angular/core';
import { SelectComponent } from './select.component';

@Component({
    template: `
        <app-select
            [(selectedOption)]="selected"
            [options]="options"
            [placeholder]="placeholder"
        ></app-select>
    `,
    imports: [SelectComponent],
})
class TestHostComponent {
    selected: string | null = null;
    options: string[] = ['Angular', 'React', 'Vue', 'Svelte'];
    placeholder = 'Pick a framework';
}

describe('SelectComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let el: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
            providers: [provideZonelessChangeDetection()],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        el = fixture.nativeElement;
    });

    function getInput(): HTMLInputElement {
        return el.querySelector('.text-input') as HTMLInputElement;
    }

    function getOptionList(): HTMLUListElement | null {
        return el.querySelector('.value-list');
    }

    function getListItems(): HTMLLIElement[] {
        return Array.from(el.querySelectorAll('.value-list li'));
    }

    function focusInput(): void {
        getInput().dispatchEvent(new Event('focusin'));
        fixture.detectChanges();
    }

    it('should create the component', () => {
        const select = fixture.debugElement.children[0].componentInstance as SelectComponent;
        expect(select).toBeTruthy();
    });

    it('should show the custom placeholder when not focused', () => {
        expect(getInput().placeholder).toBe('Pick a framework');
    });

    it('should use default placeholder when none provided', async () => {
        host.placeholder = undefined as unknown as string;
        // Reset with default - create new component without placeholder
        await TestBed.resetTestingModule()
            .configureTestingModule({
                imports: [SelectComponent],
                providers: [provideZonelessChangeDetection()],
            })
            .compileComponents();

        const standaloneFixture = TestBed.createComponent(SelectComponent);
        standaloneFixture.componentRef.setInput('options', ['a']);
        standaloneFixture.componentRef.setInput('selectedOption', null);
        standaloneFixture.detectChanges();
        const input = standaloneFixture.nativeElement.querySelector('.text-input') as HTMLInputElement;
        expect(input.placeholder).toBe('Select an option');
    });

    it('should not show the dropdown list when not focused', () => {
        expect(getOptionList()).toBeNull();
    });

    it('should show the dropdown list when input is focused', () => {
        focusInput();
        expect(getOptionList()).toBeTruthy();
    });

    it('should change placeholder to "Type to filter" when focused', () => {
        focusInput();
        expect(getInput().placeholder).toBe('Type to filter');
    });

    it('should render all options in the dropdown', () => {
        focusInput();
        const items = getListItems();
        expect(items.length).toBe(4);
        expect(items.map((li) => li.textContent!.trim())).toEqual(['Angular', 'React', 'Vue', 'Svelte']);
    });

    it('should filter options based on search string', () => {
        focusInput();
        const select = fixture.debugElement.children[0].componentInstance as SelectComponent;
        select.searchString.set('an');
        fixture.detectChanges();
        const items = getListItems();
        expect(items.map((li) => li.textContent!.trim())).toEqual(['Angular']);
    });

    it('should filter case-insensitively', () => {
        focusInput();
        const select = fixture.debugElement.children[0].componentInstance as SelectComponent;
        select.searchString.set('RE');
        fixture.detectChanges();
        const items = getListItems();
        expect(items.map((li) => li.textContent!.trim())).toEqual(['React']);
    });

    it('should select an option when clicked', () => {
        focusInput();
        const items = getListItems();
        items[1].click(); // React
        fixture.detectChanges();
        expect(host.selected).toBe('React');
    });

    it('should close the dropdown after selecting an option', () => {
        focusInput();
        const items = getListItems();
        items[0].click(); // Angular
        fixture.detectChanges();
        expect(getOptionList()).toBeNull();
    });

    it('should set selectedOption to null when onSearchChange is called with empty string', () => {
        const select = fixture.debugElement.children[0].componentInstance as SelectComponent;
        host.selected = 'Angular';
        fixture.detectChanges();
        select.onSearchChange('');
        fixture.detectChanges();
        expect(host.selected).toBeNull();
    });

    it('should not select if value is not in options', () => {
        const select = fixture.debugElement.children[0].componentInstance as SelectComponent;
        select.onSearchChange('Unknown');
        fixture.detectChanges();
        expect(host.selected).toBeNull();
    });

    describe('keyboard navigation', () => {
        function dispatchKey(key: string): void {
            const section = el.querySelector('section') as HTMLElement;
            section.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
            fixture.detectChanges();
        }

        it('should focus first item on ArrowDown when no item is focused', () => {
            focusInput();
            const items = getListItems();
            const focusSpy = vi.spyOn(items[0], 'focus');
            dispatchKey('ArrowDown');
            expect(focusSpy).toHaveBeenCalled();
        });

        it('should close dropdown and clear selection on Escape', () => {
            focusInput();
            const select = fixture.debugElement.children[0].componentInstance as SelectComponent;
            select.searchString.set('test');
            dispatchKey('Escape');
            expect(select.isFocused()).toBe(false);
            expect(select.searchString()).toBe('');
            expect(host.selected).toBeNull();
        });
    });

    describe('outside click', () => {
        it('should close dropdown when clicking outside the component', () => {
            focusInput();
            expect(getOptionList()).toBeTruthy();
            // Simulate click outside
            document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();
            expect(getOptionList()).toBeNull();
        });

        it('should not close dropdown when clicking inside the component', () => {
            focusInput();
            const section = el.querySelector('section') as HTMLElement;
            section.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();
            expect(getOptionList()).toBeTruthy();
        });
    });
});
