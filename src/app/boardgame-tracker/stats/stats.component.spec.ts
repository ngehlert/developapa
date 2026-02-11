import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { StatsComponent } from './stats.component';

describe('StatsComponent', () => {
    let component: StatsComponent;
    let fixture: ComponentFixture<StatsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatsComponent],
            providers: [provideZonelessChangeDetection(), provideRouter([])],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StatsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
