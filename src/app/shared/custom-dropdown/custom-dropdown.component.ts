import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-dropdown" [class.open]="isOpen" [class.disabled]="isDisabled">
      <div
        class="dropdown-trigger"
        role="combobox"
        aria-haspopup="listbox"
        [attr.aria-label]="ariaLabel"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="dropdownId"
        [attr.aria-activedescendant]="activeDescendantId"
        [attr.aria-disabled]="isDisabled"
        tabindex="0"
        (click)="toggleDropdown()"
        (keydown)="onTriggerKeydown($event)"
      >
        <span class="trigger-value" [class.placeholder]="!selectedLabel">
          {{ selectedLabel || placeholder }}
        </span>
        <span class="trigger-icon" aria-hidden="true"></span>
      </div>

      <div class="dropdown-list" role="listbox" [id]="dropdownId" [class.open]="isOpen">
        <button
          type="button"
          class="dropdown-option"
          *ngFor="let option of options; let i = index; trackBy: trackByValue"
          role="option"
          [id]="optionId(i)"
          [class.selected]="isSelected(option)"
          [class.active]="activeIndex === i"
          [attr.aria-selected]="isSelected(option)"
          (mouseenter)="activeIndex = i"
          (click)="selectOption(option)"
        >
          {{ option.label }}
        </button>

        <div class="dropdown-empty" *ngIf="options.length === 0">
          {{ emptyStateText }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .custom-dropdown {
      position: relative;
      width: 100%;
    }

    .dropdown-trigger {
      width: 100%;
      min-height: 42px;
      border-radius: 12px;
      border: 1px solid #3a3a3a;
      background: #1e1e1e;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      box-sizing: border-box;
    }

    .dropdown-trigger:focus-visible {
      outline: none;
      border-color: #5b9cff;
      box-shadow: 0 0 0 3px rgba(91, 156, 255, 0.2);
    }

    .trigger-value {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
    }

    .trigger-value.placeholder {
      color: rgba(255, 255, 255, 0.55);
    }

    .trigger-icon {
      width: 8px;
      height: 8px;
      border-right: 2px solid rgba(255, 255, 255, 0.7);
      border-bottom: 2px solid rgba(255, 255, 255, 0.7);
      transform: rotate(45deg);
      transition: transform 0.2s ease;
      margin-left: 12px;
      flex-shrink: 0;
    }

    .custom-dropdown.open .trigger-icon {
      transform: rotate(225deg);
    }

    .custom-dropdown.open .dropdown-trigger {
      border-color: #5b9cff;
      box-shadow: 0 0 0 2px rgba(91, 156, 255, 0.15);
    }

    .dropdown-list {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      z-index: 40;
      background: #1e1e1e;
      border: 1px solid #2f2f2f;
      border-radius: 12px;
      box-shadow: 0 14px 24px rgba(0, 0, 0, 0.35);
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transform: translateY(-6px);
      transition: max-height 0.25s ease, opacity 0.2s ease, transform 0.2s ease;
    }

    .dropdown-list.open {
      max-height: 220px;
      overflow-y: auto;
      opacity: 1;
      transform: translateY(0);
    }

    .dropdown-option {
      width: 100%;
      border: 0;
      background: transparent;
      color: #ffffff;
      text-align: left;
      padding: 11px 14px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.16s ease;
    }

    .dropdown-option:hover,
    .dropdown-option.active {
      background: #2a2a2a;
    }

    .dropdown-option.selected {
      background: rgba(91, 156, 255, 0.25);
    }

    .dropdown-empty {
      padding: 12px 14px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
    }

    .custom-dropdown.disabled .dropdown-trigger {
      cursor: not-allowed;
      opacity: 0.6;
    }

    @media (max-width: 760px) {
      .dropdown-trigger {
        min-height: 40px;
        padding: 10px 12px;
        border-radius: 10px;
      }

      .dropdown-list.open {
        max-height: 190px;
      }
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdownComponent),
      multi: true
    }
  ]
})
export class CustomDropdownComponent implements ControlValueAccessor, OnChanges {
  private static nextId = 0;

  @Input() placeholder = 'Select option';
  @Input() ariaLabel = 'Select option';
  @Input() options: DropdownOption[] = [];
  @Input() emptyStateText = 'No options available';

  isOpen = false;
  selectedValue = '';
  selectedLabel = '';
  activeIndex = -1;
  isDisabled = false;

  readonly dropdownId = `custom-dropdown-${CustomDropdownComponent.nextId++}`;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.syncSelectionFromValue();
    }
  }

  writeValue(value: string | null): void {
    this.selectedValue = value ?? '';
    this.syncSelectionFromValue();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this.closeDropdown();
    }
  }

  toggleDropdown(): void {
    if (this.isDisabled) {
      return;
    }

    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }

  openDropdown(): void {
    if (this.isDisabled) {
      return;
    }

    this.isOpen = true;
    this.activeIndex = this.selectedValue
      ? this.options.findIndex(option => option.value === this.selectedValue)
      : 0;
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.activeIndex = -1;
  }

  selectOption(option: DropdownOption): void {
    if (this.isDisabled) {
      return;
    }

    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.onChange(option.value);
    this.onTouched();
    this.closeDropdown();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled) {
      return;
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else if (this.activeIndex >= 0 && this.activeIndex < this.options.length) {
          this.selectOption(this.options[this.activeIndex]);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else {
          this.moveActive(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else {
          this.moveActive(-1);
        }
        break;
      case 'Escape':
        if (this.isOpen) {
          event.preventDefault();
          this.closeDropdown();
        }
        break;
      case 'Tab':
        this.closeDropdown();
        this.onTouched();
        break;
      default:
        break;
    }
  }

  isSelected(option: DropdownOption): boolean {
    return this.selectedValue === option.value;
  }

  optionId(index: number): string {
    return `${this.dropdownId}-option-${index}`;
  }

  get activeDescendantId(): string | null {
    if (this.activeIndex < 0) {
      return null;
    }

    return this.optionId(this.activeIndex);
  }

  trackByValue(_index: number, option: DropdownOption): string {
    return option.value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
      this.onTouched();
    }
  }

  private moveActive(step: number): void {
    if (!this.options.length) {
      this.activeIndex = -1;
      return;
    }

    if (this.activeIndex === -1) {
      this.activeIndex = 0;
      return;
    }

    const nextIndex = this.activeIndex + step;
    const wrappedIndex = (nextIndex + this.options.length) % this.options.length;
    this.activeIndex = wrappedIndex;
  }

  private syncSelectionFromValue(): void {
    const selectedOption = this.options.find(option => option.value === this.selectedValue);
    this.selectedLabel = selectedOption?.label ?? '';
  }
}
