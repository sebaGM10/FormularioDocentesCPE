import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardAlertComponent } from '@/shared/components/alert';
import { ZardIconComponent } from '@/shared/components/icon';
import { FirebaseService } from '@/shared/services/firebase.service';
import { FlowService } from '@/shared/services/flow.service';

@Component({
  selector: 'app-registro',
  imports: [
    FormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardAlertComponent,
    ZardIconComponent,
  ],
  template: `
    <div class="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand mb-4">
            <z-icon zType="user-plus" class="text-white" zSize="xl" />
          </div>
          <h1 class="text-2xl font-bold text-foreground">Registro de Usuario</h1>
          <p class="text-muted-foreground mt-1">Ingrese sus datos para comenzar el proceso</p>
        </div>

        <z-card>
          <form (submit.prevent)="onSubmit()" class="space-y-5">
            <!-- Nombre -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground" for="nombre">
                Nombre completo
              </label>
              <input
                z-input
                id="nombre"
                type="text"
                placeholder="Ej: Juan Pérez García"
                [(ngModel)]="nombre"
                name="nombre"
                required
              />
            </div>

            <!-- Cédula -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground" for="cedula">
                Cédula de identidad
              </label>
              <input
                z-input
                id="cedula"
                type="text"
                placeholder="Ej: 12345678"
                [(ngModel)]="cedula"
                name="cedula"
                required
              />
            </div>

            <!-- Correo -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground" for="correo">
                Correo electrónico
              </label>
              <input
                z-input
                id="correo"
                type="email"
                placeholder="Ej: usuario﹫correo.com"
                [(ngModel)]="correo"
                name="correo"
                required
              />
            </div>

            @if (errorMsg()) {
              <z-alert zType="destructive" [zTitle]="errorMsg()" />
            }

            <button
              z-button
              type="submit"
              zType="default"
              zSize="lg"
              zFull
              [zLoading]="loading()"
              [zDisabled]="loading()"
            >
              @if (!loading()) {
                <z-icon zType="arrow-right" />
              }
              Continuar
            </button>
          </form>
        </z-card>

        <!-- Step indicator -->
        <div class="flex items-center justify-center gap-2 mt-6">
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-border"></div>
          <div class="w-8 h-1 rounded-full bg-border"></div>
          <div class="w-8 h-1 rounded-full bg-border"></div>
        </div>
        <p class="text-center text-xs text-muted-foreground mt-2">Paso 1 de 4</p>
      </div>
    </div>
  `,
})
export default class RegistroComponent {
  nombre = '';
  cedula = '';
  correo = '';
  loading = signal(false);
  errorMsg = signal('');

  constructor(
    private firebase: FirebaseService,
    private flow: FlowService,
    private router: Router,
  ) {}

  async onSubmit() {
    this.errorMsg.set('');

    if (!this.nombre.trim() || !this.cedula.trim() || !this.correo.trim()) {
      this.errorMsg.set('Todos los campos son obligatorios.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.correo)) {
      this.errorMsg.set('Ingrese un correo electrónico válido.');
      return;
    }

    this.loading.set(true);

    try {
      // Check if user already exists by cedula
      const existingUser = await this.firebase.getUserByCedula(this.cedula.trim());

      if (existingUser) {
        // User already completed the full flow
        if (existingUser.modalidad) {
          this.loading.set(false);
          this.errorMsg.set('Esta cédula ya completó el proceso de inscripción.');
          return;
        }

        // User has partial progress — restore and resume
        this.flow.updateUser({
          docId: existingUser.id,
          nombre: existingUser.nombre,
          cedula: existingUser.cedula,
          correo: existingUser.correo,
          enSIM: existingUser.enSIM,
          enDocentes: existingUser.enDocentes,
          actaNombramientoURL: existingUser.actaNombramientoURL,
          puntaje: existingUser.puntaje,
          nivel: existingUser.nivel,
        });

        // Determine resume step
        if (existingUser.nivel != null) {
          this.router.navigate(['/resultado']);
        } else if (existingUser.enSIM || existingUser.actaNombramientoURL) {
          this.router.navigate(['/prueba']);
        } else {
          this.router.navigate(['/acta']);
        }
        return;
      }

      // New user — normal flow
      const [enSIM, enDocentes] = await Promise.all([
        this.firebase.checkInSIM(this.cedula.trim()),
        this.firebase.checkInDocentes(this.cedula.trim()),
      ]);

      const docId = await this.firebase.saveUser({
        nombre: this.nombre.trim(),
        cedula: this.cedula.trim(),
        correo: this.correo.trim(),
        enSIM,
        enDocentes,
      });

      this.flow.updateUser({
        docId,
        nombre: this.nombre.trim(),
        cedula: this.cedula.trim(),
        correo: this.correo.trim(),
        enSIM,
        enDocentes,
      });

      if (enSIM) {
        this.router.navigate(['/prueba']);
      } else {
        this.router.navigate(['/acta']);
      }
    } catch {
      this.errorMsg.set('Error al conectar con el servidor. Intente nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
