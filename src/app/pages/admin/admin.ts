import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardIconComponent } from '@/shared/components/icon';
import { ZardAlertComponent } from '@/shared/components/alert';
import {
  ZardTableComponent,
  ZardTableHeaderComponent,
  ZardTableBodyComponent,
  ZardTableRowComponent,
  ZardTableHeadComponent,
  ZardTableCellComponent,
} from '@/shared/components/table';
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
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent,
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

        <!-- Table -->
        <z-card>
          @if (loading()) {
            <div class="flex items-center justify-center py-12">
              <z-icon zType="loader-circle" class="text-brand animate-spin" zSize="xl" />
            </div>
          } @else if (users().length === 0) {
            <div class="text-center py-12">
              <z-icon zType="inbox" class="text-muted-foreground mx-auto mb-3" zSize="xl" />
              <p class="text-muted-foreground">No hay registros aún.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table z-table>
                <thead z-table-header>
                  <tr z-table-row>
                    <th z-table-head>Nombre</th>
                    <th z-table-head>Cédula</th>
                    <th z-table-head>Correo</th>
                    <th z-table-head>En SIM</th>
                    <th z-table-head>En Docentes</th>
                    <th z-table-head>Acta</th>
                    <th z-table-head>Puntaje</th>
                    <th z-table-head>Nivel</th>
                    <th z-table-head>Modalidad</th>
                  </tr>
                </thead>
                <tbody z-table-body>
                  @for (user of users(); track user.id) {
                    <tr z-table-row>
                      <td z-table-cell class="font-medium">{{ user.nombre }}</td>
                      <td z-table-cell>{{ user.cedula }}</td>
                      <td z-table-cell class="text-muted-foreground">{{ user.correo }}</td>
                      <td z-table-cell>
                        @if (user.enSIM) {
                          <z-badge zType="default" zShape="pill">Sí</z-badge>
                        } @else {
                          <z-badge zType="outline" zShape="pill">No</z-badge>
                        }
                      </td>
                      <td z-table-cell>
                        @if (user.enDocentes) {
                          <z-badge zType="default" zShape="pill">Sí</z-badge>
                        } @else {
                          <z-badge zType="outline" zShape="pill">No</z-badge>
                        }
                      </td>
                      <td z-table-cell>
                        @if (user.actaNombramientoURL) {
                          <a
                            [href]="user.actaNombramientoURL"
                            target="_blank"
                            class="text-brand hover:underline inline-flex items-center gap-1"
                          >
                            <z-icon zType="file-text" zSize="sm" />
                            Ver
                          </a>
                        } @else if (!user.enSIM) {
                          <span class="text-muted-foreground">Pendiente</span>
                        } @else {
                          <span class="text-muted-foreground">N/A</span>
                        }
                      </td>
                      <td z-table-cell>
                        @if (user.puntaje !== undefined) {
                          <span class="font-medium">{{ user.puntaje }}%</span>
                        } @else {
                          <span class="text-muted-foreground">—</span>
                        }
                      </td>
                      <td z-table-cell>
                        @if (user.nivel) {
                          <z-badge
                            [zType]="user.nivel === 'Avanzado' ? 'default' : user.nivel === 'Intermedio' ? 'secondary' : 'outline'"
                            zShape="pill"
                          >
                            {{ user.nivel }}
                          </z-badge>
                        } @else {
                          <span class="text-muted-foreground">—</span>
                        }
                      </td>
                      <td z-table-cell>
                        @if (user.modalidad) {
                          <z-badge zType="secondary" zShape="pill">
                            {{ user.modalidad }}
                          </z-badge>
                        } @else {
                          <span class="text-muted-foreground">—</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </z-card>
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
