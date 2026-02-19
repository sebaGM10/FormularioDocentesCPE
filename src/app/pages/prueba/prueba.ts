import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardIconComponent } from '@/shared/components/icon';
import { FirebaseService, type UserRecord } from '@/shared/services/firebase.service';
import { FlowService } from '@/shared/services/flow.service';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const QUESTIONS: Question[] = [
  {
    question: '¿Cuál es la capital de Colombia?',
    options: ['Medellín', 'Bogotá', 'Cali', 'Barranquilla'],
    correct: 1,
  },
  {
    question: '¿Qué tipo de recurso es una presentación de PowerPoint?',
    options: ['Hardware', 'Software de sistema', 'Recurso digital', 'Red social'],
    correct: 2,
  },
  {
    question: '¿Cuál de las siguientes es una herramienta de videoconferencia?',
    options: ['Excel', 'Zoom', 'Photoshop', 'AutoCAD'],
    correct: 1,
  },
  {
    question: '¿Qué significa TIC en el contexto educativo?',
    options: [
      'Tecnologías de la Información y la Comunicación',
      'Trabajo Individual Colaborativo',
      'Técnicas de Investigación Científica',
      'Todas las anteriores',
    ],
    correct: 0,
  },
  {
    question: '¿Cuál es una plataforma de aprendizaje en línea?',
    options: ['WhatsApp', 'Moodle', 'Instagram', 'Spotify'],
    correct: 1,
  },
  {
    question: '¿Qué es un LMS?',
    options: [
      'Learning Management System',
      'Local Media Server',
      'Language Modeling Software',
      'Linked Multimedia Service',
    ],
    correct: 0,
  },
  {
    question: '¿Cuál de estos es un navegador web?',
    options: ['Word', 'Chrome', 'Audacity', 'VLC'],
    correct: 1,
  },
  {
    question: '¿Qué extensión tiene un archivo de texto enriquecido?',
    options: ['.mp3', '.docx', '.jpg', '.exe'],
    correct: 1,
  },
  {
    question: '¿Para qué sirve Google Drive?',
    options: [
      'Editar videos',
      'Almacenar archivos en la nube',
      'Diseñar páginas web',
      'Programar aplicaciones',
    ],
    correct: 1,
  },
  {
    question: '¿Cuál de las siguientes es una buena práctica de seguridad digital?',
    options: [
      'Usar la misma contraseña para todo',
      'Compartir contraseñas con compañeros',
      'Usar contraseñas fuertes y únicas',
      'Desactivar el antivirus',
    ],
    correct: 2,
  },
];

@Component({
  selector: 'app-prueba',
  imports: [
    FormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardIconComponent,
  ],
  template: `
    <div class="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div class="w-full max-w-2xl">
        @if (!finished()) {
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand mb-4">
              <z-icon zType="clipboard-list" class="text-white" zSize="xl" />
            </div>
            <h1 class="text-2xl font-bold text-foreground">Prueba Diagnóstico</h1>
            <p class="text-muted-foreground mt-1">
              Responda las siguientes preguntas para determinar su nivel
            </p>
          </div>

          <!-- Progress -->
          <div class="mb-6">
            <div class="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Pregunta {{ currentIndex() + 1 }} de {{ questions.length }}</span>
              <span>{{ answeredCount() }} respondidas</span>
            </div>
            <div class="h-2 bg-border rounded-full overflow-hidden">
              <div
                class="h-full bg-brand rounded-full transition-all duration-300"
                [style.width.%]="((currentIndex() + 1) / questions.length) * 100"
              ></div>
            </div>
          </div>

          <!-- Question card -->
          <z-card>
            <div class="space-y-5">
              <h2 class="text-lg font-semibold text-foreground">
                {{ currentQuestion().question }}
              </h2>

              <div class="space-y-3">
                @for (option of currentQuestion().options; track $index) {
                  <button
                    class="w-full text-left p-4 rounded-xl border-2 transition-all"
                    [class]="
                      selectedAnswer() === $index
                        ? 'border-brand bg-brand-light'
                        : 'border-border hover:border-brand/40 hover:bg-muted/50'
                    "
                    (click)="selectAnswer($index)"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
                        [class]="
                          selectedAnswer() === $index
                            ? 'border-brand bg-brand text-white'
                            : 'border-border text-muted-foreground'
                        "
                      >
                        {{ ['A', 'B', 'C', 'D'][$index] }}
                      </div>
                      <span class="text-foreground">{{ option }}</span>
                    </div>
                  </button>
                }
              </div>

              <div class="flex justify-between pt-2">
                <z-button
                  zType="outline"
                  [zDisabled]="currentIndex() === 0"
                  (click)="prevQuestion()"
                >
                  <z-icon zType="arrow-left" />
                  Anterior
                </z-button>

                @if (currentIndex() < questions.length - 1) {
                  <z-button
                    zType="default"
                    [zDisabled]="selectedAnswer() === -1"
                    (click)="nextQuestion()"
                  >
                    Siguiente
                    <z-icon zType="arrow-right" />
                  </z-button>
                } @else {
                  <z-button
                    zType="default"
                    [zDisabled]="selectedAnswer() === -1"
                    [zLoading]="submitting()"
                    (click)="submitTest()"
                  >
                    Finalizar prueba
                    <z-icon zType="check" />
                  </z-button>
                }
              </div>
            </div>
          </z-card>

          <!-- Question indicators -->
          <div class="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
            @for (q of questions; track $index) {
              <button
                class="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                [class]="
                  currentIndex() === $index
                    ? 'bg-brand text-white'
                    : answers()[$index] !== undefined
                      ? 'bg-brand/20 text-brand'
                      : 'bg-border text-muted-foreground'
                "
                (click)="goToQuestion($index)"
              >
                {{ $index + 1 }}
              </button>
            }
          </div>
        } @else {
          <!-- Results summary (brief, before redirect) -->
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand/10 mb-4">
              <z-icon zType="loader-circle" class="text-brand animate-spin" zSize="xl" />
            </div>
            <h2 class="text-xl font-bold text-foreground">Procesando resultados...</h2>
          </div>
        }

        <!-- Step indicator -->
        <div class="flex items-center justify-center gap-2 mt-6">
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-brand"></div>
          <div class="w-8 h-1 rounded-full bg-border"></div>
        </div>
        <p class="text-center text-xs text-muted-foreground mt-2">Paso 3 de 4</p>
      </div>
    </div>
  `,
})
export default class PruebaComponent {
  readonly questions = QUESTIONS;
  readonly currentIndex = signal(0);
  readonly answers = signal<Record<number, number>>({});
  readonly selectedAnswer = signal(-1);
  readonly finished = signal(false);
  readonly submitting = signal(false);

  readonly currentQuestion = computed(() => this.questions[this.currentIndex()]);
  readonly answeredCount = computed(() => Object.keys(this.answers()).length);

  constructor(
    private firebase: FirebaseService,
    private flow: FlowService,
    private router: Router,
  ) {
    if (!this.flow.currentUser().cedula) {
      this.router.navigate(['/']);
    }
  }

  selectAnswer(index: number) {
    this.selectedAnswer.set(index);
    this.answers.update((prev) => ({ ...prev, [this.currentIndex()]: index }));
  }

  nextQuestion() {
    if (this.currentIndex() < this.questions.length - 1) {
      const next = this.currentIndex() + 1;
      this.currentIndex.set(next);
      this.selectedAnswer.set(this.answers()[next] ?? -1);
    }
  }

  prevQuestion() {
    if (this.currentIndex() > 0) {
      const prev = this.currentIndex() - 1;
      this.currentIndex.set(prev);
      this.selectedAnswer.set(this.answers()[prev] ?? -1);
    }
  }

  goToQuestion(index: number) {
    this.currentIndex.set(index);
    this.selectedAnswer.set(this.answers()[index] ?? -1);
  }

  async submitTest() {
    this.submitting.set(true);
    this.finished.set(true);

    let score = 0;
    const ans = this.answers();
    for (let i = 0; i < this.questions.length; i++) {
      if (ans[i] === this.questions[i].correct) {
        score++;
      }
    }

    const puntaje = Math.round((score / this.questions.length) * 100);
    let nivel: UserRecord['nivel'];
    if (puntaje < 50) {
      nivel = 'Básico';
    } else if (puntaje < 80) {
      nivel = 'Intermedio';
    } else {
      nivel = 'Avanzado';
    }

    const user = this.flow.currentUser();

    try {
      if (user.docId) {
        await this.firebase.updateUser(user.docId, { nivel, puntaje });
      }
      this.flow.updateUser({ nivel, puntaje });

      setTimeout(() => {
        this.router.navigate(['/resultado']);
      }, 1500);
    } catch {
      this.finished.set(false);
      this.submitting.set(false);
    }
  }
}
