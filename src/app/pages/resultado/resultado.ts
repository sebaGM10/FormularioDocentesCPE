import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardAlertComponent } from '@/shared/components/alert';
import { ZardIconComponent } from '@/shared/components/icon';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { FirebaseService } from '@/shared/services/firebase.service';
import { FlowService } from '@/shared/services/flow.service';

@Component({
  selector: 'app-resultado',
  imports: [
    ZardButtonComponent,
    ZardCardComponent,
    ZardAlertComponent,
    ZardIconComponent,
    ZardBadgeComponent,
  ],
  template: `
    <div class="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div class="w-full max-w-2xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            [class]="nivelColor()"
          >
            <z-icon zType="award" class="text-white" zSize="xl" />
          </div>
          <h1 class="text-2xl font-bold text-foreground">Resultados</h1>
          <p class="text-muted-foreground mt-1">
            {{ user().nombre }}, aquí están sus resultados
          </p>
        </div>

        <!-- Score Card -->
        <z-card class="mb-4">
          <div class="text-center space-y-4">
            <div class="text-5xl font-bold text-brand">{{ user().puntaje }}%</div>
            <div>
              <z-badge
                [zType]="user().nivel === 'Avanzado' ? 'default' : user().nivel === 'Intermedio' ? 'secondary' : 'outline'"
                zShape="pill"
              >
                Nivel: {{ user().nivel }}
              </z-badge>
            </div>
            <p class="text-sm text-muted-foreground">
              @switch (user().nivel) {
                @case ('Básico') {
                  Ha sido clasificado en el nivel básico. El curso le ayudará a fortalecer sus competencias fundamentales.
                }
                @case ('Intermedio') {
                  Ha sido clasificado en el nivel intermedio. Tiene una base sólida y el curso le ayudará a profundizar sus conocimientos.
                }
                @case ('Avanzado') {
                  Ha sido clasificado en el nivel avanzado. Demuestra un excelente dominio de las competencias evaluadas.
                }
              }
            </p>
          </div>
        </z-card>

        <!-- Info Cards: Datos Personales + Validaciones -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <!-- Datos Personales -->
          <z-card>
            <div class="space-y-3">
              <h2 class="text-base font-semibold text-foreground">Datos Personales</h2>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Nombre:</span>
                  <span class="font-medium text-foreground text-right">{{ user().nombre }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Cédula:</span>
                  <span class="font-medium text-foreground">{{ user().cedula }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Correo:</span>
                  <span class="font-medium text-foreground text-right break-all">{{ user().correo }}</span>
                </div>
              </div>
            </div>
          </z-card>

          <!-- Validaciones -->
          <z-card>
            <div class="space-y-3">
              <h2 class="text-base font-semibold text-foreground">Validaciones</h2>
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Base de datos SIM:</span>
                  @if (user().enSIM) {
                    <span class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      <z-icon zType="check" zSize="sm" /> Encontrado
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      <z-icon zType="x" zSize="sm" /> No encontrado
                    </span>
                  }
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Base de datos Docentes:</span>
                  @if (user().enDocentes) {
                    <span class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      <z-icon zType="check" zSize="sm" /> Encontrado
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      <z-icon zType="x" zSize="sm" /> No encontrado
                    </span>
                  }
                </div>
                @if (!user().enSIM) {
                  <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">Acta de Nombramiento:</span>
                    @if (user().actaNombramientoURL) {
                      <a
                        [href]="user().actaNombramientoURL"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                      >
                        <z-icon zType="file-check" zSize="sm" /> Subida
                      </a>
                    } @else {
                      <span class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        <z-icon zType="circle-alert" zSize="sm" /> Pendiente
                      </span>
                    }
                  </div>
                }
              </div>
            </div>
          </z-card>
        </div>

        <!-- Modality Card -->
        <z-card>
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
              <z-icon zType="monitor" zSize="sm" />
              Modalidad del curso
            </h2>

            @if (user().enDocentes) {
              <!-- User is in DOCENTES → Virtual only -->
              <z-alert
                zType="default"
                zTitle="Modalidad asignada: Virtual"
                zDescription="Al estar registrado en la base de datos de Docentes, su modalidad es exclusivamente virtual."
                zIcon="monitor"
              />
              @if (!saved()) {
                <z-button
                  zType="default"
                  zSize="lg"
                  zFull
                  [zLoading]="saving()"
                  (click)="saveModalidad('Virtual')"
                >
                  <z-icon zType="check" />
                  Confirmar inscripción
                </z-button>
              }
            } @else {
              <!-- User NOT in DOCENTES → choose -->
              <p class="text-sm text-muted-foreground">
                Seleccione la modalidad en la que desea tomar el curso:
              </p>
              <div class="grid grid-cols-2 gap-3">
                <button
                  class="p-5 rounded-xl border-2 transition-all text-center space-y-2"
                  [class]="
                    selectedModalidad() === 'Presencial'
                      ? 'border-brand bg-brand-light'
                      : 'border-border hover:border-brand/40'
                  "
                  (click)="selectedModalidad.set('Presencial')"
                >
                  <div class="flex justify-center">
                    <z-icon zType="users" zSize="xl" class="text-brand" />
                  </div>
                  <p class="font-semibold text-foreground">Presencial</p>
                  <p class="text-xs text-muted-foreground">Asistencia en sede</p>
                </button>

                <button
                  class="p-5 rounded-xl border-2 transition-all text-center space-y-2"
                  [class]="
                    selectedModalidad() === 'Virtual'
                      ? 'border-brand bg-brand-light'
                      : 'border-border hover:border-brand/40'
                  "
                  (click)="selectedModalidad.set('Virtual')"
                >
                  <div class="flex justify-center">
                    <z-icon zType="monitor" zSize="xl" class="text-brand" />
                  </div>
                  <p class="font-semibold text-foreground">Virtual</p>
                  <p class="text-xs text-muted-foreground">Clases en línea</p>
                </button>
              </div>

              @if (!saved()) {
                <z-button
                  zType="default"
                  zSize="lg"
                  zFull
                  [zDisabled]="!selectedModalidad()"
                  [zLoading]="saving()"
                  (click)="saveModalidad(selectedModalidad()!)"
                >
                  <z-icon zType="check" />
                  Confirmar inscripción
                </z-button>
              }
            }

            @if (saved()) {
              <z-alert
                zType="default"
                zTitle="Inscripción completada"
                zDescription="Su registro ha sido guardado exitosamente. Recibirá más información en su correo electrónico."
                zIcon="circle-check"
              />
            }

            @if (errorMsg()) {
              <z-alert zType="destructive" [zTitle]="errorMsg()" />
            }
          </div>
        </z-card>

        <!-- Step indicator -->
        <div class="flex items-center justify-center gap-2 mt-6">
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-brand"></div>
        </div>
        <p class="text-center text-xs text-muted-foreground mt-2">Paso 4 de 4 - Completado</p>
      </div>
    </div>
  `,
})
export default class ResultadoComponent {
  private firebase = inject(FirebaseService);
  private flow = inject(FlowService);
  private router = inject(Router);

  readonly user = this.flow.currentUser;
  readonly selectedModalidad = signal<'Virtual' | 'Presencial' | null>(null);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly errorMsg = signal('');

  readonly nivelColor = computed(() => {
    switch (this.user().nivel) {
      case 'Avanzado':
        return 'bg-emerald-600';
      case 'Intermedio':
        return 'bg-brand-accent';
      default:
        return 'bg-brand';
    }
  });

  constructor() {
    if (!this.flow.currentUser().nivel) {
      this.router.navigate(['/']);
    }
  }

  async saveModalidad(modalidad: 'Virtual' | 'Presencial') {
    const user = this.user();
    if (!user.docId) return;

    this.saving.set(true);
    this.errorMsg.set('');

    try {
      await this.firebase.updateUser(user.docId, { modalidad });
      this.flow.updateUser({ modalidad });
      this.saved.set(true);
    } catch {
      this.errorMsg.set('Error al guardar. Intente nuevamente.');
    } finally {
      this.saving.set(false);
    }
  }
}
