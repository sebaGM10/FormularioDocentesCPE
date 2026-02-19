import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardAlertComponent } from '@/shared/components/alert';
import { ZardIconComponent } from '@/shared/components/icon';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { FlowService } from '@/shared/services/flow.service';

@Component({
  selector: 'app-resultado',
  imports: [
    ZardCardComponent,
    ZardAlertComponent,
    ZardIconComponent,
    ZardBadgeComponent,
  ],
  template: `
    <div class="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
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

        <!-- Summary -->
        <z-card class="mb-4">
          <div class="space-y-3">
            <h2 class="text-base font-semibold text-foreground">Resumen de inscripción</h2>
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
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">Modalidad:</span>
                <z-badge zType="secondary" zShape="pill">{{ user().modalidad }}</z-badge>
              </div>
            </div>
          </div>
        </z-card>

        <z-alert
          zType="default"
          zTitle="Inscripción completada"
          zDescription="Su registro ha sido guardado exitosamente. Recibirá más información en su correo electrónico."
          zIcon="circle-check"
        />

        <!-- Step indicator -->
        <div class="flex items-center justify-center gap-2 mt-6">
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-brand"></div>
        </div>
        <p class="text-center text-xs text-muted-foreground mt-2">Proceso completado</p>
      </div>
    </div>
  `,
})
export default class ResultadoComponent {
  private flow = inject(FlowService);
  private router = inject(Router);

  readonly user = this.flow.currentUser;

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
}
