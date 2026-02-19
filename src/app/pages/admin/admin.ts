import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardIconComponent } from '@/shared/components/icon';
import { ZardAlertComponent } from '@/shared/components/alert';
import { FirebaseService, type UserRecord } from '@/shared/services/firebase.service';

@Component({
  selector: 'app-admin',
  imports: [
    RouterLink,
    ZardButtonComponent,
    ZardCardComponent,
    ZardBadgeComponent,
    ZardIconComponent,
    ZardAlertComponent,
  ],
  template: `
    <div class="min-h-screen bg-muted/30">
      <!-- Top bar -->
      <header class="bg-brand text-white border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <z-icon zType="shield" zSize="lg" />
            <div>
              <h1 class="text-lg font-bold">Panel de Administración</h1>
              <p class="text-sm text-white/70">Gestión de registros</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <z-button zType="ghost" class="text-white hover:bg-white/10" (click)="loadUsers()">
              <z-icon zType="refresh-cw" [class]="loading() ? 'animate-spin' : ''" />
              Actualizar
            </z-button>
            <a routerLink="/">
              <z-button zType="ghost" class="text-white hover:bg-white/10">
                <z-icon zType="arrow-left" />
                Volver
              </z-button>
            </a>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <z-card>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                <z-icon zType="users" class="text-brand" />
              </div>
              <div>
                <p class="text-2xl font-bold text-foreground">{{ users().length }}</p>
                <p class="text-xs text-muted-foreground">Total registrados</p>
              </div>
            </div>
          </z-card>
          <z-card>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <z-icon zType="trophy" class="text-emerald-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-foreground">{{ countByNivel('Avanzado') }}</p>
                <p class="text-xs text-muted-foreground">Avanzado</p>
              </div>
            </div>
          </z-card>
          <z-card>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <z-icon zType="trending-up" class="text-amber-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-foreground">{{ countByNivel('Intermedio') }}</p>
                <p class="text-xs text-muted-foreground">Intermedio</p>
              </div>
            </div>
          </z-card>
          <z-card>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <z-icon zType="book-open" class="text-blue-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-foreground">{{ countByNivel('Básico') }}</p>
                <p class="text-xs text-muted-foreground">Básico</p>
              </div>
            </div>
          </z-card>
        </div>

        @if (errorMsg()) {
          <z-alert zType="destructive" [zTitle]="errorMsg()" class="mb-4" />
        }

        <!-- Users list -->
        @if (loading()) {
          <z-card>
            <div class="flex items-center justify-center py-12">
              <z-icon zType="loader-circle" class="text-brand animate-spin" zSize="xl" />
            </div>
          </z-card>
        } @else if (users().length === 0) {
          <z-card>
            <div class="text-center py-12">
              <z-icon zType="inbox" class="text-muted-foreground mx-auto mb-3" zSize="xl" />
              <p class="text-muted-foreground">No hay registros aún.</p>
            </div>
          </z-card>
        } @else {
          <div class="space-y-4">
            @for (user of users(); track user.id) {
              <z-card>
                <div class="space-y-4">
                  <!-- Header row: Name, badges, and results -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 class="font-semibold text-foreground text-base">{{ user.nombre }}</h3>
                      <p class="text-sm text-muted-foreground">{{ user.tipoDocumento }} · {{ user.cedula }}</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      @if (user.enSIM) {
                        <z-badge zType="default" zShape="pill">SIM</z-badge>
                      }
                      @if (user.enDocentes) {
                        <z-badge zType="default" zShape="pill">Docentes</z-badge>
                      }
                      @if (user.nivel) {
                        <z-badge
                          [zType]="user.nivel === 'Avanzado' ? 'default' : user.nivel === 'Intermedio' ? 'secondary' : 'outline'"
                          zShape="pill"
                        >
                          {{ user.nivel }} · {{ user.puntaje }}%
                        </z-badge>
                      }
                      @if (user.modalidad) {
                        <z-badge zType="secondary" zShape="pill">{{ user.modalidad }}</z-badge>
                      }
                    </div>
                  </div>

                  <div class="h-px bg-border"></div>

                  <!-- Details grid -->
                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <p class="text-xs text-muted-foreground mb-0.5">Correo</p>
                      <p class="text-foreground break-all">{{ user.correo }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-muted-foreground mb-0.5">Celular</p>
                      <p class="text-foreground">{{ user.codigoPais }} {{ user.celular }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-muted-foreground mb-0.5">Departamento</p>
                      <p class="text-foreground">{{ user.departamento }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-muted-foreground mb-0.5">Municipio</p>
                      <p class="text-foreground">{{ user.municipio }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-muted-foreground mb-0.5">Cargo</p>
                      <p class="text-foreground">{{ user.cargo }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-muted-foreground mb-0.5">Sede Educativa</p>
                      <p class="text-foreground">{{ user.sedeEducativa }}</p>
                    </div>
                    @if (user.codigoDANE) {
                      <div>
                        <p class="text-xs text-muted-foreground mb-0.5">Código DANE</p>
                        <p class="text-foreground">{{ user.codigoDANE }}</p>
                      </div>
                    }
                    <div>
                      <p class="text-xs text-muted-foreground mb-0.5">Área</p>
                      <p class="text-foreground">{{ user.area }}</p>
                    </div>
                  </div>

                  <!-- Documents row -->
                  @if (user.actaNombramientoURL || user.cedulaDocURL) {
                    <div class="flex items-center gap-4 pt-1">
                      <span class="text-xs text-muted-foreground">Documentos:</span>
                      @if (user.actaNombramientoURL) {
                        <a
                          [href]="user.actaNombramientoURL"
                          target="_blank"
                          class="text-brand hover:underline inline-flex items-center gap-1 text-xs font-medium"
                        >
                          <z-icon zType="file-text" zSize="sm" />
                          Acta
                        </a>
                      }
                      @if (user.cedulaDocURL) {
                        <a
                          [href]="user.cedulaDocURL"
                          target="_blank"
                          class="text-brand hover:underline inline-flex items-center gap-1 text-xs font-medium"
                        >
                          <z-icon zType="file-check" zSize="sm" />
                          Cédula
                        </a>
                      }
                    </div>
                  }
                </div>
              </z-card>
            }
          </div>
        }
      </main>
    </div>
  `,
})
export default class AdminComponent implements OnInit {
  readonly users = signal<UserRecord[]>([]);
  readonly loading = signal(false);
  readonly errorMsg = signal('');

  constructor(private firebase: FirebaseService) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      const data = await this.firebase.getAllUsers();
      this.users.set(data);
    } catch {
      this.errorMsg.set('Error al cargar los datos.');
    } finally {
      this.loading.set(false);
    }
  }

  countByNivel(nivel: string): number {
    return this.users().filter((u) => u.nivel === nivel).length;
  }
}
