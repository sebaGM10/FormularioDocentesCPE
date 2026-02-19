import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardAlertComponent } from '@/shared/components/alert';
import { ZardIconComponent } from '@/shared/components/icon';
import type { ZardIcon } from '@/shared/components/icon/icons';
import { ZardSelectComponent, ZardSelectItemComponent } from '@/shared/components/select';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { FirebaseService, type UserRecord } from '@/shared/services/firebase.service';
import { FlowService } from '@/shared/services/flow.service';

const DEPARTAMENTOS = [
  'AMAZONAS', 'ANTIOQUIA', 'ARAUCA', 'ARCHIPIÉLAGO DE SAN ANDRÉS, PROVIDENCIA Y SANTA CATALINA',
  'ATLÁNTICO', 'BOGOTÁ, D.C.', 'BOLÍVAR', 'BOYACÁ', 'CALDAS', 'CAQUETÁ', 'CASANARE',
  'CAUCA', 'CESAR', 'CHOCÓ', 'CÓRDOBA', 'CUNDINAMARCA', 'GUAINÍA', 'GUAVIARE',
  'HUILA', 'LA GUAJIRA', 'MAGDALENA', 'META', 'NARIÑO', 'NORTE DE SANTANDER',
  'PUTUMAYO', 'QUINDIO', 'RISARALDA', 'SANTANDER', 'SUCRE', 'TOLIMA',
  'VALLE DEL CAUCA', 'VAUPÉS', 'VICHADA',
];

const CODIGOS_PAIS = [
  { code: '+57', label: '+57 Colombia' },
  { code: '+58', label: '+58 Venezuela' },
  { code: '+507', label: '+507 Panamá' },
  { code: '+55', label: '+55 Brasil' },
  { code: '+51', label: '+51 Perú' },
  { code: '+593', label: '+593 Ecuador' },
  { code: '+591', label: '+591 Bolivia' },
  { code: '+595', label: '+595 Paraguay' },
  { code: '+598', label: '+598 Uruguay' },
  { code: '+52', label: '+52 México' },
  { code: '+506', label: '+506 Costa Rica' },
  { code: '+53', label: '+53 Cuba' },
  { code: '+502', label: '+502 Guatemala' },
  { code: '+504', label: '+504 Honduras' },
  { code: '+876', label: '+876 Jamaica' },
  { code: '+505', label: '+505 Nicaragua' },
  { code: '+1787', label: '+1787 Puerto Rico' },
  { code: '+809', label: '+809 Rep. Dominicana' },
];

const AREAS = [
  'Matemáticas',
  'Humanidades (Lengua castellana/Idiomas extranjeros)',
  'Ciencias (Sociales/Historia/Constitución Política)',
  'Ciencias (Naturales/Educación Ambiental)',
  'Tecnología e Informática',
  'Educación artística y cultural',
  'Educación física, recreación y deportes',
  'Otra',
];

const NIVELES = ['Preescolar', 'Básica Primaria', 'Básica Secundaria', 'Media', 'Superior'];

interface StepDef {
  id: string;
  label: string;
  icon: ZardIcon;
}

@Component({
  selector: 'app-registro',
  imports: [
    FormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardAlertComponent,
    ZardIconComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardBadgeComponent,
  ],
  template: `
    <div class="min-h-screen bg-muted/30 py-8 px-4">
      <div class="w-full max-w-2xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand mb-3">
            <z-icon zType="clipboard-list" class="text-white" zSize="xl" />
          </div>
          <h1 class="text-2xl font-bold text-foreground">Registro de Docentes</h1>
          <p class="text-muted-foreground mt-1">Complete el formulario para inscribirse en el programa</p>
        </div>

        <!-- Stepper indicator -->
        <div class="mb-8">
          <div class="flex items-center justify-between relative">
            <!-- Connection line -->
            <div class="absolute top-4 left-0 right-0 h-0.5 bg-border z-0"></div>
            <div
              class="absolute top-4 left-0 h-0.5 bg-brand z-0 transition-all duration-500"
              [style.width.%]="((currentStep()) / (visibleSteps().length - 1)) * 100"
            ></div>

            @for (step of visibleSteps(); track step.id; let i = $index) {
              <div class="flex flex-col items-center relative z-10 cursor-pointer" (click)="goToStep(i)">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2"
                  [class]="
                    i < currentStep()
                      ? 'bg-brand border-brand text-white'
                      : i === currentStep()
                        ? 'bg-white border-brand text-brand'
                        : 'bg-white border-border text-muted-foreground'
                  "
                >
                  @if (i < currentStep()) {
                    <z-icon zType="check" zSize="sm" />
                  } @else {
                    {{ i + 1 }}
                  }
                </div>
                <span
                  class="text-[10px] mt-1 font-medium text-center max-w-[60px] leading-tight hidden sm:block"
                  [class]="i <= currentStep() ? 'text-brand' : 'text-muted-foreground'"
                >
                  {{ step.label }}
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Step content -->
        <z-card>
          <div class="space-y-5">
            <!-- Step title -->
            <div class="flex items-center gap-2 pb-2 border-b border-border">
              <z-icon [zType]="currentStepDef().icon" class="text-brand" />
              <h2 class="text-lg font-semibold text-foreground">{{ currentStepDef().label }}</h2>
            </div>

            <!-- ====== STEP 1: Identificación ====== -->
            @if (currentStepId() === 'identificacion') {
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-foreground mb-1.5 block">Tipo de documento</label>
                  <z-select [(ngModel)]="tipoDocumento" zPlaceholder="Seleccione..." name="tipoDocumento">
                    <z-select-item zValue="Cédula de Ciudadanía">Cédula de Ciudadanía</z-select-item>
                    <z-select-item zValue="Cédula de Extranjería">Cédula de Extranjería</z-select-item>
                  </z-select>
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-1.5 block">Nº documento de identidad</label>
                  <input z-input type="text" inputmode="numeric" placeholder="Ej: 12345678" [(ngModel)]="cedula" name="cedula" (input)="onNumericInput($event, 'cedula')" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Primer nombre <span class="text-destructive">*</span></label>
                    <input z-input type="text" [(ngModel)]="primerNombre" name="primerNombre" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Segundo nombre</label>
                    <input z-input type="text" [(ngModel)]="segundoNombre" name="segundoNombre" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Primer apellido <span class="text-destructive">*</span></label>
                    <input z-input type="text" [(ngModel)]="primerApellido" name="primerApellido" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Segundo apellido</label>
                    <input z-input type="text" [(ngModel)]="segundoApellido" name="segundoApellido" />
                  </div>
                </div>
              </div>
            }

            <!-- ====== STEP 2: Datos Personales ====== -->
            @if (currentStepId() === 'datos') {
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Fecha de nacimiento</label>
                    <input z-input type="date" [(ngModel)]="fechaNacimiento" name="fechaNacimiento" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Género</label>
                    <z-select [(ngModel)]="genero" zPlaceholder="Seleccione..." name="genero">
                      <z-select-item zValue="Femenino">Femenino</z-select-item>
                      <z-select-item zValue="Masculino">Masculino</z-select-item>
                    </z-select>
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-1.5 block">Celular</label>
                  <div class="grid grid-cols-[140px_1fr] gap-2">
                    <z-select [(ngModel)]="codigoPais" name="codigoPais">
                      @for (cp of codigosPais; track cp.code) {
                        <z-select-item [zValue]="cp.code">{{ cp.label }}</z-select-item>
                      }
                    </z-select>
                    <input z-input type="text" placeholder="Ej: 3001234567" [(ngModel)]="celular" name="celular" />
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-1.5 block">Correo electrónico</label>
                  <input z-input type="email" placeholder="usuario﹫correo.com" [(ngModel)]="correo" name="correo" />
                </div>
              </div>
            }

            <!-- ====== STEP 3: Ubicación y Profesión ====== -->
            @if (currentStepId() === 'profesion') {
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Departamento</label>
                    <z-select [(ngModel)]="departamento" zPlaceholder="Seleccione..." name="departamento">
                      @for (dep of departamentos; track dep) {
                        <z-select-item [zValue]="dep">{{ dep }}</z-select-item>
                      }
                    </z-select>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Municipio</label>
                    <input z-input type="text" placeholder="Ingrese su municipio" [(ngModel)]="municipio" name="municipio" />
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-1.5 block">Dirección</label>
                  <input z-input type="text" placeholder="Dirección de residencia" [(ngModel)]="direccion" name="direccion" />
                </div>

                <div class="h-px bg-border my-2"></div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Cargo</label>
                    <z-select [(ngModel)]="cargo" zPlaceholder="Seleccione..." name="cargo">
                      <z-select-item zValue="Directivo Docente">Directivo Docente</z-select-item>
                      <z-select-item zValue="Docente">Docente</z-select-item>
                    </z-select>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Sede Educativa</label>
                    <input z-input type="text" placeholder="Nombre de la sede" [(ngModel)]="sedeEducativa" name="sedeEducativa" />
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-1.5 block">Código DANE de la institución</label>
                  <input z-input type="text" inputmode="numeric" placeholder="Ej: 105001000123" [(ngModel)]="codigoDANE" name="codigoDANE" (input)="onNumericInput($event, 'codigoDANE')" />
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-1.5 block">Área a la que pertenece</label>
                  <z-select [(ngModel)]="area" zPlaceholder="Seleccione..." name="area">
                    @for (a of areas; track a) {
                      <z-select-item [zValue]="a">{{ a }}</z-select-item>
                    }
                  </z-select>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Tipo de vinculación</label>
                    <z-select [(ngModel)]="tipoVinculacion" zPlaceholder="Seleccione..." name="tipoVinculacion">
                      <z-select-item zValue="Carrera">Carrera</z-select-item>
                      <z-select-item zValue="Provisional">Provisional</z-select-item>
                    </z-select>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">Nivel al que pertenece</label>
                    <z-select [(ngModel)]="nivelPertenece" zPlaceholder="Seleccione..." name="nivelPertenece">
                      @for (n of niveles; track n) {
                        <z-select-item [zValue]="n">{{ n }}</z-select-item>
                      }
                    </z-select>
                  </div>
                </div>
              </div>
            }

            <!-- ====== STEP 4: Validación ====== -->
            @if (currentStepId() === 'validacion') {
              <div class="space-y-4">
                @if (validating()) {
                  <div class="flex flex-col items-center py-8 gap-3">
                    <z-icon zType="loader-circle" class="text-brand animate-spin" zSize="xl" />
                    <p class="text-muted-foreground">Validando su identidad en las bases de datos...</p>
                  </div>
                } @else if (validated()) {
                  <div class="space-y-3">
                    <div class="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div class="flex items-center gap-3">
                        <z-icon zType="shield" class="text-brand" />
                        <span class="font-medium text-foreground">Base de datos SIM</span>
                      </div>
                      @if (enSIM()) {
                        <z-badge zType="default" zShape="pill">Encontrado</z-badge>
                      } @else {
                        <z-badge zType="outline" zShape="pill">No encontrado</z-badge>
                      }
                    </div>

                    <div class="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div class="flex items-center gap-3">
                        <z-icon zType="users" class="text-brand" />
                        <span class="font-medium text-foreground">Base de datos DOCENTES</span>
                      </div>
                      @if (enDocentes()) {
                        <z-badge zType="default" zShape="pill">Encontrado</z-badge>
                      } @else {
                        <z-badge zType="outline" zShape="pill">No encontrado</z-badge>
                      }
                    </div>

                    @if (!enSIM()) {
                      <z-alert
                        zType="default"
                        zTitle="Documentos requeridos"
                        zDescription="Al no estar en la base de datos SIM, deberá subir su Acta de Nombramiento y Cédula en el siguiente paso."
                        zIcon="info"
                      />
                    }

                    @if (enDocentes()) {
                      <z-alert
                        zType="default"
                        zTitle="Modalidad Virtual"
                        zDescription="Al estar registrado en la base de datos de Docentes, su modalidad será exclusivamente virtual."
                        zIcon="monitor"
                      />
                    }
                  </div>
                }
              </div>
            }

            <!-- ====== STEP 5: Documentos (only if NOT in SIM) ====== -->
            @if (currentStepId() === 'documentos') {
              <div class="space-y-5">
                <z-alert
                  zType="default"
                  zTitle="Solo se aceptan archivos PDF"
                  zDescription="Suba los documentos requeridos para continuar con el proceso."
                  zIcon="info"
                />

                <!-- Acta de Nombramiento -->
                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block">Acta de Nombramiento <span class="text-destructive">*</span></label>
                  <div
                    class="border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer"
                    [class]="actaFile() ? 'border-brand bg-brand-light/50' : 'border-border hover:border-brand/50 hover:bg-muted/50'"
                    (click)="actaInput.click()"
                  >
                    <input #actaInput type="file" accept=".pdf" class="hidden" (change)="onFileSelected($event, 'acta')" />
                    @if (actaFile()) {
                      <div class="flex items-center justify-center gap-2">
                        <z-icon zType="file-check" class="text-brand" />
                        <span class="font-medium text-foreground">{{ actaFile()!.name }}</span>
                        <button class="text-sm text-destructive hover:underline ml-2" (click.stop)="actaFile.set(null)">Eliminar</button>
                      </div>
                    } @else {
                      <div class="space-y-1">
                        <z-icon zType="upload" class="text-muted-foreground mx-auto" zSize="lg" />
                        <p class="text-sm text-muted-foreground">Haga clic para seleccionar archivo PDF</p>
                      </div>
                    }
                  </div>
                </div>

                <!-- Cédula PDF -->
                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block">Documento de identidad (PDF) <span class="text-destructive">*</span></label>
                  <div
                    class="border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer"
                    [class]="cedulaFile() ? 'border-brand bg-brand-light/50' : 'border-border hover:border-brand/50 hover:bg-muted/50'"
                    (click)="cedulaInput.click()"
                  >
                    <input #cedulaInput type="file" accept=".pdf" class="hidden" (change)="onFileSelected($event, 'cedula')" />
                    @if (cedulaFile()) {
                      <div class="flex items-center justify-center gap-2">
                        <z-icon zType="file-check" class="text-brand" />
                        <span class="font-medium text-foreground">{{ cedulaFile()!.name }}</span>
                        <button class="text-sm text-destructive hover:underline ml-2" (click.stop)="cedulaFile.set(null)">Eliminar</button>
                      </div>
                    } @else {
                      <div class="space-y-1">
                        <z-icon zType="upload" class="text-muted-foreground mx-auto" zSize="lg" />
                        <p class="text-sm text-muted-foreground">Haga clic para seleccionar archivo PDF</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- ====== STEP 6: Verificación OCR (placeholder) ====== -->
            @if (currentStepId() === 'ocr') {
              <div class="flex flex-col items-center py-8 gap-4 text-center">
                <div class="w-16 h-16 rounded-2xl bg-brand-accent/20 flex items-center justify-center">
                  <z-icon zType="eye" class="text-brand" zSize="xl" />
                </div>
                <h3 class="text-lg font-semibold text-foreground">Verificación de documento</h3>
                <p class="text-muted-foreground max-w-sm">
                  En este paso se realizará la verificación automática de su documento de identidad mediante OCR.
                </p>
                <z-badge zType="secondary" zShape="pill">Próximamente</z-badge>
                <p class="text-xs text-muted-foreground">
                  Por ahora, puede continuar al siguiente paso.
                </p>
              </div>
            }

            <!-- ====== STEP 7: Modalidad y Confirmación ====== -->
            @if (currentStepId() === 'confirmacion') {
              <div class="space-y-5">
                @if (!enDocentes()) {
                  <div>
                    <label class="text-sm font-medium text-foreground mb-3 block">
                      Seleccione la modalidad en la que desea tomar el curso:
                    </label>
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
                  </div>
                } @else {
                  <z-alert
                    zType="default"
                    zTitle="Modalidad asignada: Virtual"
                    zDescription="Al estar registrado en la base de datos de Docentes, su modalidad es exclusivamente virtual."
                    zIcon="monitor"
                  />
                }

                <div class="h-px bg-border"></div>

                <!-- Consent -->
                <div class="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    [checked]="consentChecked()"
                    (change)="consentChecked.set($any($event.target).checked)"
                    name="consent"
                    class="mt-1 h-4 w-4 rounded border-border text-brand accent-[#002c5d]"
                  />
                  <label for="consent" class="text-sm text-muted-foreground">
                    He leído y aceptado el tratado y uso de mis datos.
                    <a
                      href="https://www.computadoresparaeducar.gov.co/publicaciones/66/politicas-y-condiciones-de-uso/"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-brand font-medium hover:underline"
                    >Ver</a>
                  </label>
                </div>
              </div>
            }

            <!-- Error message -->
            @if (errorMsg()) {
              <z-alert zType="destructive" [zTitle]="errorMsg()" />
            }

            <!-- Navigation buttons -->
            <div class="flex justify-between pt-3 border-t border-border">
              @if (currentStep() > 0) {
                <z-button zType="outline" (click)="prevStep()">
                  <z-icon zType="arrow-left" />
                  Anterior
                </z-button>
              } @else {
                <div></div>
              }

              @if (currentStepId() !== 'confirmacion') {
                <z-button
                  zType="default"
                  [zLoading]="validating()"
                  (click)="nextStep()"
                >
                  Siguiente
                  <z-icon zType="arrow-right" />
                </z-button>
              } @else {
                <z-button
                  zType="default"
                  zSize="lg"
                  [zLoading]="submitting()"
                  [zDisabled]="!canSubmit()"
                  (click)="submit()"
                >
                  <z-icon zType="check" />
                  Registrarse
                </z-button>
              }
            </div>
          </div>
        </z-card>

        <!-- Step counter -->
        <p class="text-center text-xs text-muted-foreground mt-4">
          Paso {{ currentStep() + 1 }} de {{ visibleSteps().length }}
        </p>
      </div>
    </div>
  `,
})
export default class RegistroComponent {
  private firebase = inject(FirebaseService);
  private flow = inject(FlowService);
  private router = inject(Router);

  // Data lists
  readonly departamentos = DEPARTAMENTOS;
  readonly codigosPais = CODIGOS_PAIS;
  readonly areas = AREAS;
  readonly niveles = NIVELES;

  // Step 1: Identificación
  tipoDocumento = '';
  cedula = '';
  primerNombre = '';
  segundoNombre = '';
  primerApellido = '';
  segundoApellido = '';

  // Step 2: Datos Personales
  fechaNacimiento = '';
  genero = '';
  codigoPais = '+57';
  celular = '';
  correo = '';

  // Step 3: Ubicación y Profesión
  departamento = '';
  municipio = '';
  direccion = '';
  cargo = '';
  sedeEducativa = '';
  codigoDANE = '';
  area = '';
  tipoVinculacion = '';
  nivelPertenece = '';

  // Step 4: Validation results
  readonly enSIM = signal(false);
  readonly enDocentes = signal(false);
  readonly validating = signal(false);
  readonly validated = signal(false);

  // Step 5: Documents
  readonly actaFile = signal<File | null>(null);
  readonly cedulaFile = signal<File | null>(null);

  // Step 7: Confirmation
  readonly selectedModalidad = signal<'Virtual' | 'Presencial' | null>(null);
  readonly consentChecked = signal(false);

  // UI State
  readonly currentStep = signal(0);
  readonly errorMsg = signal('');
  readonly submitting = signal(false);

  private allSteps: StepDef[] = [
    { id: 'identificacion', label: 'Identificación', icon: 'user' },
    { id: 'datos', label: 'Datos', icon: 'calendar' },
    { id: 'profesion', label: 'Profesión', icon: 'book-open' },
    { id: 'validacion', label: 'Validación', icon: 'shield' },
    { id: 'documentos', label: 'Documentos', icon: 'file-up' },
    { id: 'ocr', label: 'Verificación', icon: 'eye' },
    { id: 'confirmacion', label: 'Confirmación', icon: 'check' },
  ];

  readonly visibleSteps = computed<StepDef[]>(() => {
    if (this.enSIM()) {
      return this.allSteps.filter((s) => s.id !== 'documentos' && s.id !== 'ocr');
    }
    return this.allSteps;
  });

  readonly currentStepDef = computed(() => this.visibleSteps()[this.currentStep()]);
  readonly currentStepId = computed(() => this.currentStepDef().id);

  readonly canSubmit = computed(() => {
    const mod = this.enDocentes() ? true : !!this.selectedModalidad();
    return mod && this.consentChecked();
  });

  goToStep(index: number) {
    if (index < this.currentStep()) {
      this.currentStep.set(index);
      this.errorMsg.set('');
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update((v) => v - 1);
      this.errorMsg.set('');
    }
  }

  async nextStep() {
    this.errorMsg.set('');

    if (!(await this.validateCurrentStep())) return;

    // If entering validation step, auto-validate
    const nextId = this.visibleSteps()[this.currentStep() + 1]?.id;
    if (nextId === 'validacion' && !this.validated()) {
      this.currentStep.update((v) => v + 1);
      await this.runValidation();
      return;
    }

    this.currentStep.update((v) => v + 1);
  }

  onNumericInput(event: Event, field: 'cedula' | 'codigoDANE') {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^0-9]/g, '');
    if (cleaned !== input.value) {
      input.value = cleaned;
    }
    this[field] = cleaned;
  }

  private async validateCurrentStep(): Promise<boolean> {
    const id = this.currentStepId();

    if (id === 'identificacion') {
      if (!this.tipoDocumento || !this.cedula.trim() || !this.primerNombre.trim() || !this.primerApellido.trim()) {
        this.errorMsg.set('Complete los campos obligatorios: tipo de documento, número, primer nombre y primer apellido.');
        return false;
      }
      // Check if cedula is already registered
      this.validating.set(true);
      try {
        const existing = await this.firebase.getUserByCedula(this.cedula.trim());
        if (existing) {
          this.errorMsg.set('Su documento de identidad ya se encuentra registrado.');
          return false;
        }
      } catch {
        this.errorMsg.set('Error al verificar el documento. Intente nuevamente.');
        return false;
      } finally {
        this.validating.set(false);
      }
    }

    if (id === 'datos') {
      if (!this.fechaNacimiento || !this.genero || !this.celular.trim() || !this.correo.trim()) {
        this.errorMsg.set('Complete todos los campos: fecha de nacimiento, género, celular y correo.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.correo)) {
        this.errorMsg.set('Ingrese un correo electrónico válido.');
        return false;
      }
    }

    if (id === 'profesion') {
      if (!this.departamento || !this.municipio.trim() || !this.cargo || !this.sedeEducativa.trim() || !this.codigoDANE.trim() || !this.area || !this.tipoVinculacion || !this.nivelPertenece) {
        this.errorMsg.set('Complete todos los campos obligatorios.');
        return false;
      }
    }

    if (id === 'documentos') {
      if (!this.actaFile() || !this.cedulaFile()) {
        this.errorMsg.set('Debe subir ambos documentos: Acta de Nombramiento y Documento de identidad.');
        return false;
      }
    }

    return true;
  }

  private async runValidation() {
    this.validating.set(true);
    try {
      const [sim, docentes] = await Promise.all([
        this.firebase.checkInSIM(this.cedula.trim()),
        this.firebase.checkInDocentes(this.cedula.trim()),
      ]);
      this.enSIM.set(sim);
      this.enDocentes.set(docentes);
      this.validated.set(true);

      if (docentes) {
        this.selectedModalidad.set('Virtual');
      }
    } catch {
      this.errorMsg.set('Error al validar. Intente nuevamente.');
    } finally {
      this.validating.set(false);
    }
  }

  onFileSelected(event: Event, type: 'acta' | 'cedula') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.errorMsg.set('Solo se aceptan archivos PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMsg.set('El archivo no debe superar los 10MB.');
      return;
    }
    this.errorMsg.set('');

    if (type === 'acta') {
      this.actaFile.set(file);
    } else {
      this.cedulaFile.set(file);
    }
  }

  async submit() {
    if (!this.canSubmit()) return;
    this.submitting.set(true);
    this.errorMsg.set('');

    try {
      let actaURL: string | undefined;
      let cedulaDocURL: string | undefined;

      if (!this.enSIM()) {
        if (this.actaFile()) {
          actaURL = await this.firebase.uploadFile(
            this.actaFile()!,
            `actas/${this.cedula.trim()}_${Date.now()}.pdf`,
          );
        }
        if (this.cedulaFile()) {
          cedulaDocURL = await this.firebase.uploadFile(
            this.cedulaFile()!,
            `cedulas/${this.cedula.trim()}_${Date.now()}.pdf`,
          );
        }
      }

      const modalidad = this.enDocentes() ? 'Virtual' : this.selectedModalidad()!;
      const fullName = [this.primerNombre, this.segundoNombre, this.primerApellido, this.segundoApellido]
        .filter(Boolean)
        .join(' ')
        .trim();

      const user: Record<string, unknown> = {
        tipoDocumento: this.tipoDocumento,
        cedula: this.cedula.trim(),
        primerNombre: this.primerNombre.trim(),
        primerApellido: this.primerApellido.trim(),
        fechaNacimiento: this.fechaNacimiento,
        genero: this.genero,
        codigoPais: this.codigoPais,
        celular: this.celular.trim(),
        correo: this.correo.trim(),
        departamento: this.departamento,
        municipio: this.municipio.trim(),
        cargo: this.cargo,
        sedeEducativa: this.sedeEducativa.trim(),
        codigoDANE: this.codigoDANE.trim(),
        area: this.area,
        tipoVinculacion: this.tipoVinculacion,
        nivelPertenece: this.nivelPertenece,
        enSIM: this.enSIM(),
        enDocentes: this.enDocentes(),
        nombre: fullName,
        modalidad,
      };

      // Only add optional fields if they have a value (Firestore rejects undefined)
      if (this.segundoNombre.trim()) user['segundoNombre'] = this.segundoNombre.trim();
      if (this.segundoApellido.trim()) user['segundoApellido'] = this.segundoApellido.trim();
      if (this.direccion.trim()) user['direccion'] = this.direccion.trim();
      if (actaURL) user['actaNombramientoURL'] = actaURL;
      if (cedulaDocURL) user['cedulaDocURL'] = cedulaDocURL;

      const docId = await this.firebase.saveUser(user as unknown as UserRecord);

      this.flow.updateUser({
        docId,
        nombre: fullName,
        cedula: this.cedula.trim(),
        correo: this.correo.trim(),
        enSIM: this.enSIM(),
        enDocentes: this.enDocentes(),
        modalidad,
        actaNombramientoURL: actaURL,
      });

      this.router.navigate(['/prueba']);
    } catch {
      this.errorMsg.set('Error al registrarse. Intente nuevamente.');
    } finally {
      this.submitting.set(false);
    }
  }
}
