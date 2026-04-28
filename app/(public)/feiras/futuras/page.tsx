"use client";

import React, { FormEvent, useEffect, useMemo, useState, useRef, ReactNode } from "react";
import Image, { StaticImageData } from "next/image";
import heroFestivalImage from "../../../../public/img/hero-festival.jpg";
import secao3Image from "../../../../public/img/secao-3.jpg";
import logoOIB from "../../../../public/img/Logo_OIB.png";
import img3 from "../../../../public/img/img_3.jpg";

function FadeIn({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const metricsCards = [
  {
    value: "+ 5.000 pessoas",
    title: "Media de Publico",
    text: "Visitantes circulando intensamente nas edicoes e rotatividade rapida no mesmo final de semana.",
  },
  {
    value: "R$ 10k a 25k",
    title: "Media de Faturamento",
    text: "O modelo concentra a demanda e faz a operacao rodar alta sem inflar equipe.",
  },
  {
    value: "80% de Retorno",
    title: "Retencao de Marcas",
    text: "A maioria esmagadora de quem investe em um stand confia e retorna na edicao seguinte.",
  },
];

const proofItems = [
  {
    eyebrow: "Ambiente desejado",
    title: "Festival com cara de acontecimento",
    text: "Cenografia, musica, fila boa e um publico que vai para experimentar marcas memoraveis.",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
    alt: "Publico reunido em um evento ao ar livre",
  },
  {
    eyebrow: "Ticket e repeticao",
    title: "Comida bonita vende mais rapido",
    text: "Operacoes com visual forte e entrega consistente puxam foto, prova social e recompra no mesmo evento.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    alt: "Mesa com pratos gastronomicos servidos",
  },
  {
    eyebrow: "Selecao enxuta",
    title: "Poucas marcas, mais lembranca",
    text: "Quando a curadoria segura a quantidade, cada expositor aparece mais, vende melhor e sai mais valorizado.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    alt: "Ambiente de gastronomia com pessoas consumindo",
  },
];

type MediaItem = {
  kind: "video" | "foto";
  title: string;
  note: string;
  description: string;
  event: string;
  when: string;
  image: StaticImageData | string;
  alt: string;
  embedUrl?: string;
  videoUrl?: string;
  orientation?: "vertical" | "horizontal" | "square";
};

const photoGallery: MediaItem[] = [
  {
    kind: "foto",
    title: "Público curtindo o evento",
    note: "Fila, palco e movimento forte desde o inicio.",
    description:
      "Uma leitura aberta da entrada principal mostrando o volume de gente e a energia de quem chega para consumir, circular e descobrir marca nova.",
    event: "Festival Botecagem",
    when: "Ultima edicao",
    image: heroFestivalImage,
    alt: "Publico reunido em volta do palco principal do festival",
    orientation: "horizontal"
  },
  {
    kind: "foto",
    title: "Galera na feira",
    note: "Ambiente vivo, mesas ocupadas e fluxo constante.",
    description:
      "Imagem de apoio para mostrar a atmosfera das ultimas feiras com publico circulando, consumindo e interagindo com as operacoes.",
    event: "Feira gastronomica",
    when: "Edicao recente",
    image: img3,
    alt: "Publico em evento ao ar livre",
    orientation: "vertical"
  }
];

const videoGallery: MediaItem[] = [
  {
    kind: "video",
    title: "Festival Botecagem - Dia 1",
    note: "Ambiente, música e fluxo constante.",
    description:
      "Acompanhe o movimento e a energia do primeiro dia do Festival Gastronômico Botecagem.",
    event: "Festival Botecagem",
    when: "Dia 1",
    image: heroFestivalImage,
    alt: "Capa de video Botecagem Dia 1",
    videoUrl: "/video/BOTECAGEM_DIA_1.MP4",
    orientation: "vertical",
  },
  {
    kind: "video",
    title: "Festival Botecagem - Dia 2",
    note: "Segundo dia com muito sucesso.",
    description:
      "Veja as atrações e o público aproveitando o segundo dia do Festival Gastronômico Botecagem.",
    event: "Festival Botecagem",
    when: "Dia 2",
    image: secao3Image,
    alt: "Capa de video Botecagem Dia 2",
    videoUrl: "/video/BOTECAGEM_DIA_2.MP4",
    orientation: "vertical",
  },
];

const steps = [
  "Voce entra na fila prioritaria com os dados da operacao.",
  "A curadoria cruza categoria, cidade, estrutura e momento da agenda.",
  "As marcas aprovadas recebem proposta com praca, formato e janela de fechamento.",
];

const includedItems = [
  "Espaco em evento com curadoria ativa",
  "Apoio comercial para encaixe por cidade e categoria",
  "Briefing de estrutura e operacao antes do fechamento",
  "Contato rapido para proposta, reserva ou lista de espera",
];

export type UpcomingFair = {
  id: string;
  title: string;
  local: string;
  days: string;
};



type FormState = {
  name: string;
  brand: string;
  category: string;
  customCategory: string;
  whatsapp: string;
  instagram: string;
  structure: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  brand: "",
  category: "",
  customCategory: "",
  whatsapp: "",
  instagram: "",
  structure: "",
  message: "",
};

export default function LandingPage() {
  const [upcomingFairs, setUpcomingFairs] = useState<UpcomingFair[]>([]);
  const [isLoadingFairs, setIsLoadingFairs] = useState(true);

  const [form, setForm] = useState<FormState>(initialForm);
  const [feedback, setFeedback] = useState<string>("");
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [selectedFair, setSelectedFair] = useState<UpcomingFair | null>(null);
  const [modalForm, setModalForm] = useState({
    tentModel: "",
    area: "",
    productDescription: ""
  });
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [fairScarcityLabels, setFairScarcityLabels] = useState<string[]>([]);
  const [headerNotification, setHeaderNotification] = useState<{label: string, text: string}>({
    label: "Últimas vagas",
    text: "Verificando agenda..."
  });

  useEffect(() => {
    async function fetchFairs() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(`${apiUrl}/public/marketplace/fairs`);
        const data = await response.json();
        
        const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
        
        const formattedFairs = (data.items || []).map((item: any) => {
          let daysStr = "";
          if (item.startDate && item.endDate) {
            const startParts = item.startDate.split('-');
            const endParts = item.endDate.split('-');
            const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
            const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
            
            daysStr = `${formatter.format(start).replace('.', '')} • ${formatter.format(end).replace('.', '')}`;
          } else if (item.startDate) {
            const startParts = item.startDate.split('-');
            const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
            daysStr = formatter.format(start).replace('.', '');
          }
          
          let local = item.address || "";
          if (item.city) {
             local += local ? ` - ${item.city}` : item.city;
          }

          return {
            id: item.id,
            title: item.name,
            local: local || "Local a definir",
            days: daysStr || "Data a definir"
          };
        });
        
        setUpcomingFairs(formattedFairs);
      } catch (error) {
        console.error("Erro ao buscar feiras:", error);
      } finally {
        setIsLoadingFairs(false);
      }
    }
    fetchFairs();
  }, []);

  const closeInterestModal = () => {
    setIsInterestModalOpen(false);
    setTimeout(() => {
      setModalForm({ tentModel: "", area: "", productDescription: "" });
    }, 300);
  };

  const [activeMediaTab, setActiveMediaTab] = useState<"fotos" | "videos">("fotos");
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null);
  const interestMutation = { isPending: false };
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511997642624";
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=Olá%2C%20gostaria%20de%20conversar%20com%20a%20equipe%20comercial%20para%20entender%20como%20expor%20nas%20próximas%20feiras.`;
  const mediaByTab = {
    fotos: photoGallery,
    videos: videoGallery,
  } as const;
  const currentMediaItems = mediaByTab[activeMediaTab];
  const currentMediaItem = currentMediaItems[activeMediaIndex] ?? currentMediaItems[0];

  useEffect(() => {
    if (upcomingFairs.length === 0) return;
    const texts = [
      "Últimas Vagas",
      "85% Ocupado",
      "Lista de Espera em Breve",
      "Restam poucas vagas",
      "Fechando Categorias",
      "Última Chamada",
      "Alta Procura",
      "Lotes Esgotando",
      "Quase Lotado",
      "Vagas Escassas"
    ];
    setFairScarcityLabels(upcomingFairs.map(() => texts[Math.floor(Math.random() * texts.length)]));

    const randomFair = upcomingFairs[Math.floor(Math.random() * upcomingFairs.length)];
    const headerLabels = [
      "Últimas vagas",
      "Alta procura",
      "Quase lotado",
      "Vagas escassas",
      "Última chamada"
    ];
    const headerMessages = [
      "quase encerrando",
      "com últimos espaços",
      "esgotando rapidamente",
      "com poucas vagas",
      "lista de espera em breve",
      "fechando últimas categorias",
      "com vagas voando"
    ];

    setHeaderNotification({
      label: headerLabels[Math.floor(Math.random() * headerLabels.length)],
      text: `${randomFair.title} ${headerMessages[Math.floor(Math.random() * headerMessages.length)]}`
    });
  }, [upcomingFairs]);

  useEffect(() => {
    if (isInterestModalOpen || upcomingFairs.length === 0) return;
    const timer = setInterval(() => {
      setCarouselIndex((current) => (current + 1) % upcomingFairs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isInterestModalOpen, upcomingFairs.length]);

  const buttonText = useMemo(() => {
    if (interestMutation.isPending) {
      return "Enviando sua prioridade...";
    }

    return "Quero entrar na fila prioritaria";
  }, [interestMutation.isPending]);

  const projectedPrice = useMemo(() => {
    let base = 0;
    if (modalForm.tentModel === "Carrinho") base = 1500;
    else if (modalForm.tentModel === "2m x 2m") base = 2000;
    else if (modalForm.tentModel === "3m x 3m") base = 2500;
    else if (modalForm.tentModel === "3m x 6m") base = 3200;
    else if (modalForm.tentModel === "Trailer / Food Truck") base = 3500;

    let areaMod = 0;
    if (modalForm.area === "Área Premium (Próximo ao Palco)") areaMod = 800;
    else if (modalForm.area === "Área Comercial (Entrada do Evento)") areaMod = 500;
    else if (modalForm.area === "Praça de Alimentação (Padrão)") areaMod = 0;
    else if (modalForm.area === "Área Alternativa (Mais Econômica)") areaMod = -300;

    return base ? base + areaMod : 0;
  }, [modalForm.tentModel, modalForm.area]);

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projectedPrice);
  }, [projectedPrice]);

  function handleModalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFair) return;
    
    let priceText = projectedPrice > 0 ? `\r\nInvestimento Estimado: *${formattedPrice}*` : "";

    const message = `*NOVA RESERVA DE INTERESSE*

Olá! Quero garantir minha vaga na feira ativa da vitrine:
*Evento:* ${selectedFair.title}
*Data:* ${selectedFair.days}

*Minha Operação:*
*Estrutura:* ${modalForm.tentModel}
*Localização Desejada:* ${modalForm.area}${priceText}
${modalForm.productDescription ? `*O que eu vendo:* _${modalForm.productDescription}_` : ""}

Aguardo o retorno da curadoria para alinhar os próximos passos!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappLink, "_blank");
    
    setIsInterestModalOpen(false);
    setModalForm({
      tentModel: "",
      area: "",
      productDescription: ""
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    // Formatting the unified form payload safely
    const categoryLabel = form.category === 'outros' ? form.customCategory : form.category;
    const message = `*SOLICITAÇÃO DE CURADORIA - FILA UNIFICADA*

Olá equipe! Acabei de me cadastrar na vitrine para rodar nas próximas edições do circuito. Seguem meus dados cadastrais:

*Responsável:* ${form.name}
*Marca:* ${form.brand}
*Categoria:* ${categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1)}
*Instagram:* ${form.instagram}
*Estrutura Preferencial:* ${form.structure}

*Qual o nosso diferencial:* 
_${form.message}_

Aguardo análise da equipe para os próximos passos e propostas comerciais!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappLink, "_blank");

    setFeedback(`Sua ficha foi enviada para o nosso WhatsApp! Um curador retornará o contato o mais breve possível.`);
    setForm(initialForm);
  }

  useEffect(() => {
    if (currentMediaItems.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveMediaIndex((current) => (current + 1) % currentMediaItems.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [currentMediaItems]);

  useEffect(() => {
    if (!selectedMediaItem) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMediaItem]);

  function goToPreviousMedia() {
    setActiveMediaIndex((current) =>
      current === 0 ? currentMediaItems.length - 1 : current - 1,
    );
  }

  function goToNextMedia() {
    setActiveMediaIndex((current) => (current + 1) % currentMediaItems.length);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
        <div className="liquid-glass header-enter pointer-events-auto mx-auto flex max-w-7xl items-center justify-between rounded-lg px-4 py-3 md:px-6">
          <a
            href="#topo"
            className="header-enter-item flex items-center transition-transform hover:scale-105"
            style={{ animationDelay: "120ms" }}
          >
            <Image 
              src={logoOIB}
              alt="Only in BR"
              className="h-12 w-auto object-contain md:h-14 lg:h-16"
              priority
            />
          </a>

          <div
            className="header-enter-item hidden items-center gap-3 rounded-lg border border-red-500/50 bg-[linear-gradient(135deg,rgba(220,38,38,0.6),rgba(239,68,68,0.2),rgba(18,18,18,0.6))] px-4 py-2 shadow-[0_8px_32px_rgba(220,38,38,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] md:flex"
            style={{ animationDelay: "220ms" }}
          >
            <span className="signal-pulse h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(220,38,38,0.9)]" />
            <div className="leading-tight">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-red-200">
                {headerNotification.label}
              </p>
              <p className="text-sm font-semibold text-white">
                {headerNotification.text}
              </p>
            </div>
          </div>

          <a
            href="#futuras-feiras"
            className="header-enter-item rounded-lg border border-white/15 bg-[linear-gradient(135deg,#f06e4d,#e05d3f)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(224,93,63,0.26)] hover:-translate-y-0.5 hover:brightness-110"
            style={{ animationDelay: "360ms" }}
          >
            Quero minha vaga
          </a>
        </div>
      </header>

      <main id="topo">
        <section className="relative isolate overflow-hidden">
          <Image
            src={heroFestivalImage}
            alt="Festival gastronomico lotado com publico em volta do palco"
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            className="object-cover object-[center_16%] md:object-[center_18%] scale-100"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,15,12,0.84)_0%,rgba(3,15,12,0.76)_24%,rgba(3,15,12,0.34)_54%,rgba(3,15,12,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,7,0.18)_0%,rgba(7,7,7,0.1)_28%,rgba(7,7,7,0.44)_72%,rgba(7,7,7,0.7)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(240,195,106,0.18),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(45,139,115,0.14),transparent_20%)]" />

          <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-12 pt-28 md:px-8 md:pb-16 md:pt-32">
            <div className="max-w-[48rem] space-y-6">
              <h1 className="max-w-[18ch] text-4xl font-semibold leading-[0.98] text-white sm:text-5xl md:text-6xl lg:text-[4.2rem]">
                Exponha onde o publico
                <br className="hidden md:block" />
                chega para comprar.
              </h1>

              <p className="max-w-[42rem] text-base leading-7 text-white/90 sm:text-lg md:text-[1.28rem] md:leading-9">
                Categorias limitadas, curadoria forte e uma feira que favorece marcas prontas para vender desde o primeiro pico.
              </p>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg bg-[linear-gradient(135deg,#1fc16b,#128c4a)] px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_18px_34px_rgba(18,140,74,0.32)] hover:-translate-y-0.5 hover:brightness-110"
              >
                Entrar em contato no WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section id="midia" className="border-t border-[var(--line)] bg-zinc-50 py-16 md:py-20 overflow-hidden">
          <FadeIn className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
              <div className="lg:w-1/3 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
                <h2 className="text-balance text-3xl font-semibold leading-tight text-zinc-900 md:text-4xl lg:text-5xl">
                  Veja o que rolou nas ultimas feiras.
                </h2>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMediaTab("fotos");
                      setActiveMediaIndex(0);
                    }}
                    className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                      activeMediaTab === "fotos"
                        ? "bg-[linear-gradient(135deg,#1fc16b,#128c4a)] text-white shadow-[0_4px_12px_rgba(18,140,74,0.3)]"
                        : "border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50"
                    }`}
                  >
                    Fotos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMediaTab("videos");
                      setActiveMediaIndex(0);
                    }}
                    className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                      activeMediaTab === "videos"
                        ? "bg-[linear-gradient(135deg,#1fc16b,#128c4a)] text-white shadow-[0_4px_12px_rgba(18,140,74,0.3)]"
                        : "border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50"
                    }`}
                  >
                    Videos
                  </button>
                </div>
              </div>

              <div className="lg:w-2/3 flex items-center justify-between gap-2 sm:gap-4 w-full">
                <button
                  type="button"
                  onClick={goToPreviousMedia}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-4xl font-bold text-emerald-600 hover:scale-110 transition-transform"
                  aria-label="Item anterior"
                >
                  ‹
                </button>

                <div className="flex flex-1 gap-4 sm:gap-6 overflow-hidden">
                  {[0, 1].map((offset) => {
                    const index = (activeMediaIndex + offset) % currentMediaItems.length;
                    const item = currentMediaItems[index];
                    return (
                      <button
                        key={`${item.title}-${index}-${offset}`}
                        type="button"
                        onClick={() => setSelectedMediaItem(item)}
                        className={`group flex-1 flex-col rounded-2xl bg-white border border-emerald-100 pb-5 hover:-translate-y-1 transition-transform duration-300 shadow-xl overflow-hidden ${offset === 1 ? 'hidden sm:flex' : 'flex'}`}
                        style={{ minWidth: 0 }}
                      >
                        <div className="relative w-full aspect-[4/3] bg-emerald-50/50 p-3 pb-0">
                          <div className="relative h-full w-full overflow-hidden rounded-lg border border-black/5">
                            <Image
                              src={item.image}
                              alt={item.alt}
                              fill
                              priority={true}
                              sizes="(min-width: 1024px) 30vw, 80vw"
                              className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            />
                            {item.kind === "video" ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/80 backdrop-blur-sm border border-emerald-200 transition-transform group-hover:scale-110 shadow-lg">
                                  <span className="ml-[2px] mt-[1px] text-white text-sm drop-shadow-sm">▶</span>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="pt-4 px-4 flex-1 flex items-center justify-center">
                           <p className="text-center font-bold text-emerald-950 text-base lg:text-lg leading-tight line-clamp-2 px-2">
                             {item.title}
                           </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={goToNextMedia}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-4xl font-bold text-emerald-600 hover:scale-110 transition-transform"
                  aria-label="Proximo item"
                >
                  ›
                </button>
              </div>
            </div>
          </FadeIn>
        </section>

        <section id="curadoria" className="relative w-full border-t border-black/10 min-h-[100svh] lg:h-[100svh] bg-[#0a0a0a] lg:overflow-hidden flex flex-col pt-20 lg:pt-24">
          <div className="absolute inset-y-0 left-0 w-full lg:w-[60%] z-0 h-[45svh] lg:h-full">
            <Image
              src={secao3Image}
              alt="Ambiente da feira gastronomica"
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/50 lg:bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 lg:via-[#0a0a0a]/60 lg:to-black/50 pointer-events-none" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-8 pb-12 pt-8 lg:py-0 h-full flex flex-col lg:justify-center lg:overflow-y-auto mt-auto lg:mt-0">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 w-full lg:my-auto items-center">
              
              <div className="flex flex-col justify-center space-y-4 lg:space-y-6 order-1">
                <span className="text-xs lg:text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-alt)] drop-shadow-md">
                  Numeros que fecham a conta
                </span>
                <h2 className="max-w-2xl text-balance text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl drop-shadow-lg">
                  O resultado é visivel na margem final e no balcão cheio.
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base drop-shadow-md">
                  Fazer parte da feira é sobre construir rentabilidade rápida. Com uma estrutura pensada pro alto fluxo, veja o que os números indicam e porque os espaços acabam rápido demais:
                </p>
                
                <div className="pt-2 lg:pt-4">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-lg bg-[linear-gradient(135deg,#1fc16b,#128c4a)] px-6 py-3 md:py-4 text-center text-sm font-semibold text-white shadow-[0_12px_28px_rgba(18,140,74,0.32)] hover:-translate-y-0.5 hover:brightness-110 transition-transform"
                  >
                    Falar no WhatsApp para mais informações
                  </a>
                </div>
              </div>

              <div className="grid gap-4 lg:pl-10 items-center order-2">
                {metricsCards.map((item, index) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/10 px-5 py-5 sm:px-6 sm:py-6 backdrop-blur-md"
                    style={{
                      background: "rgba(10,10,10,0.65)"
                    }}
                  >
                    <p className="text-3xl font-bold drop-shadow-sm" style={{
                      color: index === 0 ? "rgba(240,195,106,1)" : index === 1 ? "rgba(45,139,115,1)" : "rgba(224,93,63,1)"
                    }}>{item.value}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-300 md:text-base">{item.text}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        <section id="vantagens" className="bg-white py-8 lg:py-10 relative overflow-hidden min-h-[50svh] flex flex-col justify-center border-b border-black/5">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 md:px-8">
            <div className="flex flex-col items-center text-center gap-2 mb-6 lg:mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                A Decisão
              </span>
              <h2 className="text-balance text-xl font-semibold leading-tight text-zinc-900 md:text-2xl max-w-2xl">
                Suas vantagens fechando agora (e os riscos de ficar de fora)
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
              
              <div className="relative rounded-2xl border border-emerald-400/40 bg-emerald-500/10 backdrop-blur-xl p-5 shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-1">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                
                <h3 className="text-lg font-bold text-emerald-700">
                  Tudo pronto para você faturar
                </h3>
                <p className="text-zinc-700 text-xs leading-relaxed font-medium">
                  Ao entrar na feira, você recebe uma infraestrutura completa feita para sua marca brilhar e você focar na fila:
                </p>
                <ul className="space-y-2 text-zinc-900 text-xs font-semibold">
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-600 text-sm">✓</span> <span>Banner e faixas personalizados com sua marca.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-600 text-sm">✓</span> <span>Barraca totalmente montada e estruturada.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-600 text-sm">✓</span> <span>Sistema Próprio de Vendas rápido e seguro.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-600 text-sm">✓</span> <span>Canal de suporte VIP durante o evento.</span>
                  </li>
                </ul>
              </div>

              <div className="relative rounded-2xl border border-red-400/40 bg-red-500/10 backdrop-blur-xl p-5 shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-1">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

                <h3 className="text-lg font-bold text-red-700">
                  O preço de pensar demais
                </h3>
                <p className="text-zinc-700 text-xs leading-relaxed font-medium">
                  Para mantermos as vendas lá em cima, limitamos agressivamente o número de vagas. Ficar de fora causa prejuízo:
                </p>
                <ul className="space-y-2 text-zinc-900 text-xs font-semibold">
                  <li className="flex gap-2 items-start">
                    <span className="text-red-600 text-sm">✕</span> <span>Vê seu concorrente ocupar a vaga da sua categoria.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-red-600 text-sm">✕</span> <span>Perde a vitrine para +5.000 bocas quentes pra consumir.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-red-600 text-sm">✕</span> <span>Abre mão de um violento pico de caixa de R$10k a R$25k rápido.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        <section id="futuras-feiras" className="bg-white py-8 md:py-10 overflow-hidden border-y border-black/5 relative flex flex-col justify-center">
          <div className="mx-auto max-w-7xl px-4 md:px-8 mb-5 flex flex-col items-center text-center gap-3 relative z-10">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              Próximas Edições
            </span>
            <h2 className="text-balance text-2xl font-semibold leading-tight text-zinc-900 md:text-3xl max-w-2xl">
              Nossa agenda oficial de festivais
            </h2>
          </div>

          <div className="relative mx-auto w-full max-w-[1400px] h-[280px] flex items-center justify-center">
            {isLoadingFairs ? (
              <div className="flex flex-col items-center justify-center text-zinc-400">
                <span className="animate-spin text-3xl mb-2">↻</span>
                <p className="text-sm font-medium">Carregando feiras...</p>
              </div>
            ) : upcomingFairs.length === 0 ? (
              <div className="text-zinc-500 text-center font-medium">
                Nenhuma feira futura encontrada no momento.
              </div>
            ) : upcomingFairs.map((fair, index) => {
               const len = upcomingFairs.length;
               let offset = index - carouselIndex;
               
               if (offset > Math.floor(len / 2)) offset -= len;
               if (offset < -Math.floor(len / 2)) offset += len;
               
               const isCenter = offset === 0;
               let translateX = offset * 110; 
               let scale = isCenter ? 1 : 0.85;
               let opacity = isCenter ? 1 : Math.max(1 - Math.abs(offset) * 0.45, 0);
               let zIndex = 30 - Math.abs(offset);
               
               if (Math.abs(offset) > 2) opacity = 0; 

               return (
                 <div
                   key={fair.id}
                   onClick={() => setCarouselIndex(index)}
                   className={`absolute w-[82vw] sm:w-[340px] transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${!isCenter ? 'cursor-pointer hover:-translate-y-2' : ''}`}
                   style={{
                     transform: `translateX(${translateX}%) scale(${scale})`,
                     zIndex,
                     opacity,
                     pointerEvents: opacity === 0 ? 'none' : 'auto'
                   }}
                 >
                    <div className={`w-full rounded-2xl border ${isCenter ? 'border-emerald-300 shadow-[0_16px_50px_rgba(16,185,129,0.15)] bg-emerald-50' : 'border-zinc-200/60 shadow-xl bg-white'} overflow-hidden flex flex-col h-full transform-gpu`}>
                      <div className={`${isCenter ? 'bg-emerald-100/50' : 'bg-zinc-50'} px-4 py-3 flex justify-between items-center border-b border-black/5`}>
                        <span className={`text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 ${isCenter ? 'text-red-500' : 'text-zinc-400'}`}>
                          {isCenter && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                          {isCenter ? (fairScarcityLabels[index] || "Vagas Limitadas") : "Confirmada"}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isCenter ? 'bg-emerald-500/10 text-emerald-600' : 'bg-black/5 text-zinc-500'}`}>
                          {fair.days}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 p-5 lg:p-6">
                        <h3 className={`text-base lg:text-lg font-bold mt-1 line-clamp-2 ${isCenter ? 'text-emerald-950' : 'text-zinc-600'}`}>
                          {fair.title}
                        </h3>
                        <div className={`flex items-start gap-1.5 text-xs mt-auto mb-5 font-medium line-clamp-1 ${isCenter ? 'text-emerald-900/60' : 'text-zinc-500'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span>{fair.local}</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                             e.stopPropagation();
                             if (!isCenter) {
                               setCarouselIndex(index);
                               return;
                             }
                             setSelectedFair(fair);
                             setIsInterestModalOpen(true);
                          }}
                          className={`w-full py-3 rounded-xl text-center text-xs sm:text-sm font-bold transition-all duration-300 ${isCenter ? 'bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.2)] hover:-translate-y-1 hover:bg-emerald-400' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                        >
                          {isCenter ? "Demonstrar Interesse" : "Ver Feira"}
                        </button>
                      </div>
                    </div>
                 </div>
               )
            })}
          </div>

          <div className="flex justify-center gap-2 mt-4 relative z-20">
            {upcomingFairs.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir para a feira ${i + 1}`}
                onClick={() => setCarouselIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === carouselIndex ? 'bg-emerald-500 scale-125' : 'bg-zinc-200 hover:bg-emerald-300'}`}
              />
            ))}
          </div>
        </section>

        {/* <section id="reserva" className="border-t border-[var(--line)] bg-zinc-50 py-16 md:py-20">
          <FadeIn className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1.05fr_0.95fr] md:px-8">
            <div className="space-y-5">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-soft)]">
                Fila Unificada
              </span>
              <h2 className="text-balance text-3xl font-semibold leading-tight text-zinc-900 md:text-5xl">
                Quer rodar o ano inteiro? A mesma curadoria te coloca em todas as feiras.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-zinc-600 md:text-lg">
                Preencha seu perfil de marca. A nossa triagem cruza ativamente a sua operação com as agendas disponíveis em todas as praças do circuito, garantindo janelas de alta conversão sem você precisar caçar vagas evento por evento.
              </p>

              <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-alt)]">
                  Acontece depois do envio
                </p>
                <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-600">
                  <p>1. Sua marca entra na triagem interna.</p>
                  <p>2. A equipe cruza categoria e agenda disponivel.</p>
                  <p>3. O retorno chega pelo WhatsApp com proposta ou lista de espera.</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 py-5 md:px-6 md:py-6"
            >
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Seu nome"
                    value={form.name}
                    onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                    placeholder="Nome do responsavel"
                  />
                  <Field
                    label="Marca"
                    value={form.brand}
                    onChange={(value) => setForm((current) => ({ ...current, brand: value }))}
                    placeholder="Nome da operacao"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Categoria"
                    value={form.category}
                    onChange={(value) => {
                       setForm((current) => {
                          const nextState = { ...current, category: value };
                          if (value !== 'outros') nextState.customCategory = '';
                          return nextState;
                       });
                    }}
                  />
                  {form.category === 'outros' && (
                    <Field
                      label="Qual categoria?"
                      value={form.customCategory}
                      onChange={(value) => setForm((current) => ({ ...current, customCategory: value }))}
                      placeholder="Ex.: Pastel, Tacos, Cerveja..."
                    />
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="WhatsApp"
                    value={form.whatsapp}
                    onChange={(value) => setForm((current) => ({ ...current, whatsapp: value }))}
                    placeholder="(41) 99999-9999"
                  />
                  <Field
                    label="Instagram"
                    value={form.instagram}
                    onChange={(value) => setForm((current) => ({ ...current, instagram: value }))}
                    placeholder="@sua_marca"
                  />
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-900">Estrutura Principal</span>
                  <select
                    value={form.structure}
                    onChange={(e) => setForm((current) => ({ ...current, structure: e.target.value }))}
                    className="min-h-12 w-full rounded-lg border border-black/5 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[var(--accent-soft)] focus:outline-none"
                    required
                  >
                    <option value="" disabled>Qual o formato padrão da sua barraca?</option>
                    <option value="2m x 2m">2m x 2m</option>
                    <option value="3m x 3m">3m x 3m</option>
                    <option value="3m x 6m">3m x 6m</option>
                    <option value="Trailer / Food Truck">Trailer / Food Truck</option>
                    <option value="Carrinho">Carrinho</option>
                  </select>
                </label>

                <TextAreaField
                  label="O que faz sua marca disputar atencao"
                  value={form.message}
                  onChange={(value) => setForm((current) => ({ ...current, message: value }))}
                  placeholder="Conte rapidamente o produto, faixa de ticket e porque sua operacao encaixa bem."
                />

                <button
                  type="submit"
                  disabled={interestMutation.isPending}
                  className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 hover:-translate-y-0.5 hover:bg-[#f06e4d]"
                >
                  {buttonText}
                </button>

                {feedback ? (
                  <p className="rounded-lg border border-[rgba(45,139,115,0.35)] bg-[rgba(45,139,115,0.12)] px-4 py-3 text-sm leading-7 text-[#e7f7ef]">
                    {feedback}
                  </p>
                ) : null}
              </div>
            </form>
          </FadeIn>
        </section> */}
      </main>

      {selectedMediaItem ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/78 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedMediaItem(null)}
        >
          <div
            className={`flex flex-col w-full overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] ${selectedMediaItem.orientation === "vertical" ? "max-w-md" : "max-w-5xl"}`}
            style={{ maxHeight: '92vh' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between border-b border-black/5 px-5 py-4 md:px-6 bg-white z-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-soft)]">
                  {selectedMediaItem.kind === "foto" ? "Galeria de fotos" : "Galeria de videos"}
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-900">{selectedMediaItem.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMediaItem(null)}
                className="rounded-lg border border-black/5 bg-black/5 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-black/10 transition-colors"
              >
                Fechar
              </button>
            </div>

            <div className={`relative w-full bg-black flex items-center justify-center overflow-hidden ${selectedMediaItem.orientation === "vertical" ? "aspect-[9/16]" : "aspect-video"}`} style={{ maxHeight: 'calc(92vh - 85px)' }}>
                {selectedMediaItem.kind === "video" && selectedMediaItem.embedUrl ? (
                  <iframe
                    src={selectedMediaItem.embedUrl}
                    title={selectedMediaItem.title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedMediaItem.kind === "video" && selectedMediaItem.videoUrl ? (
                  <video
                    src={selectedMediaItem.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="absolute inset-0 h-full w-full object-contain outline-none bg-black"
                  >
                     Seu navegador não suporta a reprodução de vídeos.
                  </video>
                ) : (
                  <>
                    <Image
                      src={selectedMediaItem.image}
                      alt={selectedMediaItem.alt}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-contain"
                    />
                    {selectedMediaItem.kind === "video" ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/22">
                        <div className="rounded-full bg-[rgba(224,93,63,0.95)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900 shadow-[0_16px_36px_rgba(224,93,63,0.28)]">
                          Video pronto para embed
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Demonstrar Interesse Extras */}
      {isInterestModalOpen && selectedFair && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" onClick={closeInterestModal} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-black/10 overflow-hidden z-10 flex flex-col max-h-[90vh] transition-all">
            <div className="px-6 py-5 border-b border-black/5 bg-zinc-50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">Configure sua estrutura</h3>
              <button type="button" onClick={closeInterestModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-6 flex-1 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="bg-emerald-50 border border-emerald-200/60 rounded-lg p-4 text-sm text-emerald-800 font-medium">
                Sua reserva será direcionada para:<br/>
                <strong className="text-zinc-900 font-bold block mt-1 leading-tight">{selectedFair.title}</strong>
                <span className="text-zinc-600 text-xs mt-1 block">{selectedFair.days}</span>
              </div>

              <div className="space-y-2">
                <label htmlFor="tentModel" className="text-sm font-medium text-zinc-900">Qual o modelo da sua barraca?</label>
                <select
                  id="tentModel"
                  required
                  value={modalForm.tentModel}
                  onChange={(e) => setModalForm({...modalForm, tentModel: e.target.value})}
                  className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition-colors hover:border-black/20 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] lg:text-sm"
                >
                  <option value="" disabled>Selecione um formato...</option>
                  <option value="2m x 2m">2m x 2m</option>
                  <option value="3m x 3m">3m x 3m</option>
                  <option value="3m x 6m">3m x 6m</option>
                  <option value="Trailer / Food Truck">Trailer / Food Truck</option>
                  <option value="Carrinho">Carrinho</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="area" className="text-sm font-medium text-zinc-900">Qual a área preferencial?</label>
                <select
                  id="area"
                  required
                  value={modalForm.area}
                  onChange={(e) => setModalForm({...modalForm, area: e.target.value})}
                  className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition-colors hover:border-black/20 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] lg:text-sm"
                >
                  <option value="" disabled>Selecione um local do evento...</option>
                  <option value="Área Premium (Próximo ao Palco)">Área Premium (Próximo ao Palco)</option>
                  <option value="Área Comercial (Entrada do Evento)">Área Comercial (Entrada do Evento)</option>
                  <option value="Praça de Alimentação (Padrão)">Praça de Alimentação (Padrão)</option>
                  <option value="Área Alternativa (Mais Econômica)">Área Alternativa (Mais Econômica)</option>
                </select>
              </div>

              {projectedPrice > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/50 flex items-center justify-between animate-in fade-in zoom-in duration-300">
                  <div>
                    <span className="block text-xs font-semibold text-emerald-800 uppercase tracking-widest">Investimento Previsto</span>
                    <span className="block text-xl font-bold text-emerald-600 mt-0.5">
                       {formattedPrice}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700/60 leading-tight max-w-[120px] text-right font-medium">Média sujeita à aprovação final de curadoria.</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="productDescription" className="text-sm font-medium text-zinc-900">Breve descrição do produto</label>
                  <span className="text-xs text-zinc-500">Opcional</span>
                </div>
                <textarea
                  id="productDescription"
                  placeholder="Ex: Hambúrguer artesanal defumado em lenha..."
                  rows={3}
                  value={modalForm.productDescription}
                  onChange={(e) => setModalForm({...modalForm, productDescription: e.target.value})}
                  className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition-colors resize-y hover:border-black/20 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] lg:text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[linear-gradient(135deg,#1fc16b,#128c4a)] px-6 py-4 text-center text-sm font-semibold text-white shadow-[0_12px_28px_rgba(18,140,74,0.22)] hover:-translate-y-0.5 hover:brightness-110 transition-transform"
              >
                Comprar Agora
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-900">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 rounded-lg border border-black/5 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--accent-soft)] focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-900">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-lg border border-black/5 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-[var(--accent-soft)] focus:outline-none"
      >
        <option value="" className="text-black">
          Escolha uma categoria
        </option>
        <option value="hamburguer" className="text-black">
          Hamburguer
        </option>
        <option value="pizza" className="text-black">
          Pizza
        </option>
        <option value="churrasco" className="text-black">
          Churrasco
        </option>
        <option value="drinks" className="text-black">
          Drinks
        </option>
        <option value="doces" className="text-black">
          Doces
        </option>
        <option value="outros" className="text-black">
          Outros
        </option>
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-900">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
        className="rounded-lg border border-black/5 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--accent-soft)] focus:outline-none"
      />
    </label>
  );
}
