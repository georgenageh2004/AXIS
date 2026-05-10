import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserManagementService, ClubUser } from '../services/user-management.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: ClubUser[] = [];
  selectedUser: ClubUser | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  saveError: string | null = null;
  saveSuccess: string | null = null;

  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(6)]
    })
  });

  constructor(private userService: UserManagementService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get visibleUsers(): ClubUser[] {
    return this.users.filter((user) => user.role !== 0);
  }

  selectUser(user: ClubUser): void {
    this.selectedUser = user;
    this.saveError = null;
    this.saveSuccess = null;
    this.form.patchValue({
      email: user.email,
      password: ''
    });
  }

  save(): void {
    if (!this.selectedUser) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const emailValue = this.form.value.email?.trim() ?? '';
    const passwordValue = this.form.value.password ?? '';

    this.saving = true;
    this.saveError = null;
    this.saveSuccess = null;

    this.userService
      .updateUser(this.selectedUser.userId, {
        email: emailValue,
        password: passwordValue,
        role: this.selectedUser.role
      })
      .subscribe({
        next: () => {
          this.users = this.users.map((user) =>
            user.userId === this.selectedUser?.userId
              ? { ...user, email: emailValue }
              : user
          );
          this.saveSuccess = 'User updated successfully.';
          this.saving = false;
        },
        error: (err) => {
          this.saveError = err?.error?.message || 'Failed to update user.';
          this.saving = false;
        }
      });
  }

  roleLabel(role: number): string {
    if (role === 0) {
      return 'IT';
    }
    if (role === 1) {
      return 'Scout';
    }
    if (role === 2) {
      return 'Analyst';
    }
    return `Role ${role}`;
  }

  trackByUserId(index: number, user: ClubUser): number {
    return user.userId;
  }

  private loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getClubUsers().subscribe({
      next: (users) => {
        this.users = users ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load users.';
        this.loading = false;
      }
    });
  }
}
