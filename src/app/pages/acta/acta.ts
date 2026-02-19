import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardAlertComponent } from '@/shared/components/alert';
import { ZardIconComponent } from '@/shared/components/icon';
import { FirebaseService } from '@/shared/services/firebase.service';
import { FlowService } from '@/shared/services/flow.service';

@Component({
  selector: 'app-acta',
  imports: [
    ZardButtonComponent,
    ZardCardComponent,
    ZardAlertComponent,
    ZardIconComponent,
  ],
  template: `
    <div class="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-accent mb-4">
            <z-icon zType="file-up" class="text-brand" zSize="xl" />
          </div>
          <h1 class="text-2xl font-bold text-foreground">Acta de Nombramiento</h1>
          <p class="text-muted-foreground mt-1">
            No se encontró su cédula en la base de datos SIM.
            Por favor, suba su Acta de Nombramiento para continuar.
          </p>
        </div>

        <z-card>
          <div class="space-y-5">
            <z-alert
              zType="default"
              zTitle="Documento requerido"
              zDescription="Solo se aceptan archivos en formato PDF."
              zIcon="info"
            />

            <!-- Upload area -->
            <div
              class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
              [class]="selectedFile() ? 'border-brand bg-brand-light/50' : 'border-border hover:border-brand/50 hover:bg-muted/50'"
              (click)="fileInput.click()"
              (dragover.prevent)="onDragOver()"
              (dragleave)="onDragLeave()"
              (drop.prevent)="onDrop($event)"
            >
              <input
                #fileInput
                type="file"
                accept=".pdf"
                class="hidden"
                (change)="onFileSelected($event)"
              />

              @if (selectedFile()) {
                <div class="space-y-2">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10">
                    <z-icon zType="file-check" class="text-brand" zSize="lg" />
                  </div>
                  <p class="font-medium text-foreground">{{ selectedFile()!.name }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ (selectedFile()!.size / 1024).toFixed(1) }} KB
                  </p>
                  <button
                    class="text-sm text-destructive hover:underline"
                    (click.stop)="removeFile()"
                  >
                    Eliminar archivo
                  </button>
                </div>
              } @else {
                <div class="space-y-2">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted">
                    <z-icon zType="upload" class="text-muted-foreground" zSize="lg" />
                  </div>
                  <p class="font-medium text-foreground">
                    Haga clic o arrastre su archivo aquí
                  </p>
                  <p class="text-sm text-muted-foreground">PDF - Máx. 10MB</p>
                </div>
              }
            </div>

            @if (errorMsg()) {
              <z-alert zType="destructive" [zTitle]="errorMsg()" />
            }

            <z-button
              zType="default"
              zSize="lg"
              zFull
              [zLoading]="uploading()"
              [zDisabled]="!selectedFile() || uploading()"
              (click)="onUpload()"
            >
              @if (!uploading()) {
                <z-icon zType="upload" />
              }
              Subir y continuar
            </z-button>
          </div>
        </z-card>

        <!-- Step indicator -->
        <div class="flex items-center justify-center gap-2 mt-6">
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-border"></div>
          <div class="w-8 h-1 rounded-full bg-border"></div>
        </div>
        <p class="text-center text-xs text-muted-foreground mt-2">Paso 2 de 4</p>
      </div>
    </div>
  `,
})
export default class ActaComponent {
  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  errorMsg = signal('');

  constructor(
    private firebase: FirebaseService,
    private flow: FlowService,
    private router: Router,
  ) {
    if (!this.flow.currentUser().cedula) {
      this.router.navigate(['/']);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.validateAndSet(input.files[0]);
    }
  }

  onDragOver() {}

  onDragLeave() {}

  onDrop(event: Event) {
    const file = (event as DragEvent).dataTransfer?.files[0];
    if (file) {
      this.validateAndSet(file);
    }
  }

  private validateAndSet(file: File) {
    this.errorMsg.set('');
    if (file.type !== 'application/pdf') {
      this.errorMsg.set('Solo se aceptan archivos PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMsg.set('El archivo no debe superar los 10MB.');
      return;
    }
    this.selectedFile.set(file);
  }

  removeFile() {
    this.selectedFile.set(null);
  }

  async onUpload() {
    const file = this.selectedFile();
    const user = this.flow.currentUser();
    if (!file || !user.docId || !user.cedula) return;

    this.uploading.set(true);
    this.errorMsg.set('');

    try {
      const url = await this.firebase.uploadActa(file, user.cedula);
      await this.firebase.updateUser(user.docId, { actaNombramientoURL: url });
      this.flow.updateUser({ actaNombramientoURL: url });
      this.router.navigate(['/prueba']);
    } catch {
      this.errorMsg.set('Error al subir el archivo. Intente nuevamente.');
    } finally {
      this.uploading.set(false);
    }
  }
}
