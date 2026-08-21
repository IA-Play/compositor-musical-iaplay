const fs = require('fs');
let content = fs.readFileSync('d:/ANTIGRAVITY/iaplay/locales/translations.ts', 'utf8');

const pt_common = `,
      import: 'Importar',
      export_json: 'Baixar Projeto (JSON)',
      duplicate: 'Duplicar',
      ok: 'OK',
      cancel_action: 'Cancelar',
      confirm_action: 'Confirmar',
      wait: 'Aguarde um momento...'
    },`;
content = content.replace(/limit:\s*'Limite'\s*\n    \},/g, "limit: 'Limite'" + pt_common);

const pt_messages = `,
      extracting_tags: 'Extraindo Tags...',
      analyzing_dna: 'Analisando DNA da Letra...',
      searching_db: 'Pesquisando na Base de Dados...',
      creating_pitch: 'Criando Pitch de Lançamento...',
      imagining_cover: 'Imaginando Conceito Visual...',
      reading_score: 'Lendo Partitura...',
      autopsy: 'Realizando Autópsia Sônica...',
      generic_error: 'Ocorreu um erro durante a operação.'
    },`;
content = content.replace(/project_configured:\s*'Projeto Configurado com Sucesso!'\s*\n    \},/g, "project_configured: 'Projeto Configurado com Sucesso!'" + pt_messages);

const pt_dashboard = `,
      import_success: 'Projeto importado com sucesso!',
      import_error: 'Erro ao importar arquivo. Formato inválido.',
      invalid_file: 'Arquivo inválido. Certifique-se de que é um projeto IAPLAY (.json).',
      btn_import: 'Importar'
    },`;
content = content.replace(/no_lyrics:\s*'Sem letra definida\.\.\.'\s*\n    \},/g, "no_lyrics: 'Sem letra definida...'" + pt_dashboard);

const pt_editor = `,
      prompt_artist: 'Qual artista você quer usar como referência?',
      prompt_artist_ex: 'Ex: Michael Jackson, The Weeknd',
      prompt_dna: 'Analisar DNA Sônico de qual artista?',
      prompt_dna_ex: 'Ex: Hans Zimmer, Linkin Park',
      prompt_consult: 'No que você precisa de ajuda?',
      prompt_consult_ex: 'Ex: Sugira uma rima para "amor"',
      dna_success: 'DNA Sônico extraído e adicionado às instruções globais.',
      ai_detector_warning: 'Escreva ou gere uma letra primeiro para usar o Detector de IA.',
      plagiarism_warning: 'Escreva uma letra primeiro para verificar plágio.',
      pitch_warning: 'Escreva ou gere uma letra primeiro para criar o Pitch do Spotify.',
      cover_warning: 'Escreva ou gere uma letra primeiro para criar um conceito de capa.',
      cover_tip: 'Dica: Esta imagem foi criada exclusivamente para o seu projeto baseado na letra e sentimento. Para gerar uma nova versão, clique novamente no botão "Gerar Capa".',
      cover_title: 'Arte da Capa Gerada',
      cover_fullscreen: 'Ver em Tela Cheia',
      btn_vision: 'Partitura (Vision)',
      btn_detector: 'Detector de IA',
      btn_plagiarism: 'Detetive de Plágio',
      btn_pitch: 'Gerar Pitch (Spotify)',
      btn_cover: 'Gerar Capa (IA Art)',
      music_title: 'Título da Música...',
      tags_placeholder: '+ Tag...',
      suggestions: 'Sugestões',
      saved: 'Salvo',
      btn_save: 'Salvar',
      no_tags: 'Nenhuma tag gerada...',
      close_btn: 'FECHAR',
      recommended: 'Recomendado',
      pt_br: 'Português',
      en: 'Inglês',
      es: 'Espanhol',
      engine: 'Motor de Inteligência',
      project_caps: 'PROJETO',
      composition_editor: 'EDITOR DE COMPOSIÇÃO'
    },`;
content = content.replace(/modal_assist_title:\s*'Consultor Criativo'\s*\n    \},/g, "modal_assist_title: 'Consultor Criativo'" + pt_editor);

const en_common = `,
      import: 'Import',
      export_json: 'Download Project (JSON)',
      duplicate: 'Duplicate',
      ok: 'OK',
      cancel_action: 'Cancel',
      confirm_action: 'Confirm',
      wait: 'Please wait a moment...'
    },`;
content = content.replace(/limit:\s*'Limit'\s*\n    \},/g, "limit: 'Limit'" + en_common);

const en_messages = `,
      extracting_tags: 'Extracting Tags...',
      analyzing_dna: 'Analyzing Lyrics DNA...',
      searching_db: 'Searching Database...',
      creating_pitch: 'Creating Pitch...',
      imagining_cover: 'Visualizing Cover Concept...',
      reading_score: 'Reading Sheet Music...',
      autopsy: 'Performing Sonic Autopsy...',
      generic_error: 'An error occurred during the operation.'
    },`;
content = content.replace(/project_configured:\s*'Project Configured Successfully!'\s*\n    \},/g, "project_configured: 'Project Configured Successfully!'" + en_messages);

const en_dashboard = `,
      import_success: 'Project imported successfully!',
      import_error: 'Error importing file. Invalid format.',
      invalid_file: 'Invalid file. Make sure it is an IAPLAY (.json) project.',
      btn_import: 'Import'
    },`;
content = content.replace(/no_lyrics:\s*'No lyrics defined\.\.\.'\s*\n    \},/g, "no_lyrics: 'No lyrics defined...'" + en_dashboard);

const en_editor = `,
      prompt_artist: 'Which artist do you want to use as a reference?',
      prompt_artist_ex: 'Ex: Drake, Metallica',
      prompt_dna: 'Analyze Sonic DNA of which artist?',
      prompt_dna_ex: 'Ex: Hans Zimmer, Linkin Park',
      prompt_consult: 'What do you need help with?',
      prompt_consult_ex: 'Ex: Suggest a rhyme for "love"',
      dna_success: 'Sonic DNA extracted and added to global instructions.',
      ai_detector_warning: 'Write or generate lyrics first to use the AI Detector.',
      plagiarism_warning: 'Write lyrics first to check for plagiarism.',
      pitch_warning: 'Write or generate lyrics first to create the Spotify Pitch.',
      cover_warning: 'Write or generate lyrics first to create a cover concept.',
      cover_tip: 'Tip: This image was created exclusively for your project based on the lyrics and sentiment. To generate a new version, click the "Generate Cover" button again.',
      cover_title: 'Generated Cover Art',
      cover_fullscreen: 'View Full Screen',
      btn_vision: 'Sheet Music (Vision)',
      btn_detector: 'AI Detector',
      btn_plagiarism: 'Plagiarism Detective',
      btn_pitch: 'Generate Pitch (Spotify)',
      btn_cover: 'Generate Cover (AI Art)',
      music_title: 'Song Title...',
      tags_placeholder: '+ Tag...',
      suggestions: 'Suggestions',
      saved: 'Saved',
      btn_save: 'Save',
      no_tags: 'No tags generated...',
      close_btn: 'CLOSE',
      recommended: 'Recommended',
      pt_br: 'Portuguese',
      en: 'English',
      es: 'Spanish',
      engine: 'Intelligence Engine',
      project_caps: 'PROJECT',
      composition_editor: 'COMPOSITION EDITOR'
    },`;
content = content.replace(/modal_assist_title:\s*'Creative Consultant'\s*\n    \},/g, "modal_assist_title: 'Creative Consultant'" + en_editor);

const es_common = `,
      import: 'Importar',
      export_json: 'Descargar Proyecto (JSON)',
      duplicate: 'Duplicar',
      ok: 'OK',
      cancel_action: 'Cancelar',
      confirm_action: 'Confirmar',
      wait: 'Por favor, espere un momento...'
    },`;
content = content.replace(/limit:\s*'Límite'\s*\n    \},/g, "limit: 'Límite'" + es_common);

const es_messages = `,
      extracting_tags: 'Extrayendo Etiquetas...',
      analyzing_dna: 'Analizando ADN de la Letra...',
      searching_db: 'Buscando en Base de Datos...',
      creating_pitch: 'Creando Pitch de Lanzamiento...',
      imagining_cover: 'Imaginando Concepto Visual...',
      reading_score: 'Leyendo Partitura...',
      autopsy: 'Realizando Autopsia Sónica...',
      generic_error: 'Un error ocurrió durante la operación.'
    },`;
content = content.replace(/project_configured:\s*'¡Proyecto Configurado con Éxito!'\s*\n    \},/g, "project_configured: '¡Proyecto Configurado con Éxito!'" + es_messages);

const es_dashboard = `,
      import_success: '¡Proyecto importado con éxito!',
      import_error: 'Error al importar archivo. Formato inválido.',
      invalid_file: 'Archivo inválido. Asegúrese de que sea un proyecto IAPLAY (.json).',
      btn_import: 'Importar'
    },`;
content = content.replace(/no_lyrics:\s*'Sin letra definida\.\.\.'\s*\n    \},/g, "no_lyrics: 'Sin letra definida...'" + es_dashboard);

const es_editor = `,
      prompt_artist: '¿Qué artista quieres usar como referencia?',
      prompt_artist_ex: 'Ej: Bad Bunny, Shakira',
      prompt_dna: '¿Analizar ADN Sónico de qué artista?',
      prompt_dna_ex: 'Ej: Hans Zimmer, Linkin Park',
      prompt_consult: '¿En qué necesitas ayuda?',
      prompt_consult_ex: 'Ej: Sugiere una rima para "amor"',
      dna_success: 'ADN Sónico extraído y añadido a las instrucciones globales.',
      ai_detector_warning: 'Escribe o genera una letra primero para usar el Detector de IA.',
      plagiarism_warning: 'Escribe una letra primero para verificar plagio.',
      pitch_warning: 'Escribe o genera una letra primero para crear el Pitch de Spotify.',
      cover_warning: 'Escribe o genera una letra primero para crear un concepto de portada.',
      cover_tip: 'Sugerencia: Esta imagen fue creada exclusivamente para tu proyecto basándose en la letra y el sentimiento. Para generar una nueva versión, haz clic nuevamente en el botón "Generar Portada".',
      cover_title: 'Arte de Portada Generado',
      cover_fullscreen: 'Ver en Pantalla Completa',
      btn_vision: 'Partitura (Vision)',
      btn_detector: 'Detector de IA',
      btn_plagiarism: 'Detective de Plagio',
      btn_pitch: 'Generar Pitch (Spotify)',
      btn_cover: 'Generar Portada (IA Art)',
      music_title: 'Título de la Canción...',
      tags_placeholder: '+ Tag...',
      suggestions: 'Sugerencias',
      saved: 'Guardado',
      btn_save: 'Guardar',
      no_tags: 'Ninguna etiqueta generada...',
      close_btn: 'CERRAR',
      recommended: 'Recomendado',
      pt_br: 'Portugués',
      en: 'Inglés',
      es: 'Español',
      engine: 'Motor de Inteligencia',
      project_caps: 'PROYECTO',
      composition_editor: 'EDITOR DE COMPOSICIÓN'
    },`;
content = content.replace(/modal_assist_title:\s*'Consultor Creativo'\s*\n    \},/g, "modal_assist_title: 'Consultor Creativo'" + es_editor);

fs.writeFileSync('d:/ANTIGRAVITY/iaplay/locales/translations.ts', content);
console.log('Translations updated successfully.');
