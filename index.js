import express from "express";
import puppeteer from "puppeteer";
import fs from "fs";

const app = express();
app.use(express.json());
app.post("/api/extraer", async (req, res) => {
  const { url, selector } = req.body;
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`NAVEGADOR (${msg.type()}):`, msg.text());
      }
    });


    await page.goto(`https://facility.sistemaedi.com.pe/`, { waitUntil: 'domcontentloaded' })

    await page.evaluate(() => {
      localStorage.setItem('accessEdi', JSON.stringify({
        "Flagproveedor": false,
        "Flagconfiguracionpersona": true,
        "Login": "SOPORTEEDI",
        "Nombre": "SOPORTE EDI SISTEMA",
        "PrimerNombre": "SOPORTE",
        "ApellidoPaterno": "",
        "ApellidoMaterno": "",
        "Email": "bmartinezf@tgestiona.com.pe",
        "IdCliente": 21,
        "Telefono": "93",
        "Celular": "999999999",
        "Id": 3647
      }));
      localStorage.setItem('accessToken', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyRGF0YSI6IntcIkZsYWdwcm92ZWVkb3JcIjpmYWxzZSxcIkZsYWdjb25maWd1cmFjaW9ucGVyc29uYVwiOmZhbHNlLFwiY291bnRIb3VyTWludXRlXCI6MzY0NyxcIkxvZ2luXCI6XCJzb3BvcnRlZWRpXCIsXCJOb21icmVVc3VhcmlvXCI6XCJTT1BPUlRFXCIsXCJPcmlnZW5cIjoxLFwiSWRDbGllbnRlRGVmYXVsdFwiOjIxLFwiTGlzdFJvbGVzXCI6WzEsMTA0OSwxMDY4XX0iLCJGZWNoYUhvcmFMb2dpbiI6IjE5LzExLzIwMjUgMTQ6MzA6MjkiLCJuYmYiOjE3NjM1NjI2MjksImV4cCI6MTc2MzU3NzAyOSwiaWF0IjoxNzYzNTYyNjI5LCJpc3MiOiJodHRwczovL3d3dy5zaXN0ZW1hZWRpLmNvbS5wZSIsImF1ZCI6Imh0dHBzOi8vd3d3LnNpc3RlbWFlZGkuY29tLnBlIn0.EhhDK3JnzLiXKRiAlwbw3MCQ8evs9d-2q9lUrFOgU3c");
      localStorage.setItem('usuarioFavorito', JSON.stringify({
        "id": 3647,
        "menuItems": [
          {
            "id": 8210,
            "path": "/admin",
            "title": "Administración",
            "descripcion": null,
            "type": "sub",
            "icontype": "apps",
            "movil": false,
            "collapse": "Administracion",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8211,
                "path": "bandcliente",
                "title": "Clientes",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "CL",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 16413,
                "path": "Bandeja-Noticias",
                "title": "Noticias",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": [
                  {
                    "id": 10897,
                    "nombre": "Activar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10898,
                    "nombre": "Desactivar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10899,
                    "nombre": "Eliminar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 11014,
                    "nombre": "Guardar",
                    "descripcion": null,
                    "elemento": null
                  }
                ]
              },
              {
                "id": 16428,
                "path": "/Parametros-Equipos",
                "title": "Parámetros de Equipos",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "ParámetrosdeEquipos",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16429,
                    "path": "Bandeja-Tipo-Equipos",
                    "title": "Tipos de Equipos",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10924,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10925,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10926,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10927,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11013,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 16297,
                "path": "/ParametrosGenerales",
                "title": "Parámetros Generales",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "ParámetrosGenerales",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16300,
                    "path": "Bandeja-Notificaciones",
                    "title": "Notificacion",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10982,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10983,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10984,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10985,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16301,
                    "path": "Bandeja-Reglas-Asignacion",
                    "title": "Reglas Asignacion",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10986,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10987,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10988,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10989,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16313,
                    "path": "Bandeja-Reportes",
                    "title": "Reportes",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10990,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10991,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10992,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10993,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10994,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16449,
                    "path": "Bandeja-Roles",
                    "title": "Roles",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10972,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10973,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10974,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10975,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16299,
                    "path": "Bandeja-Usuarios",
                    "title": "Usuario",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10976,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10977,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10978,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10979,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10980,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10981,
                        "nombre": "CargaMasiva",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 16417,
                "path": "/Parametros-Inmuebles",
                "title": "Parámetros Inmuebles",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "ParámetrosInmuebles",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16419,
                    "path": "Bandeja-Arrendatario-Propietario-Usuario",
                    "title": "Arrendatario, Propietario y Usuario",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10916,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10917,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10918,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10919,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11017,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16418,
                    "path": "Bandeja-Condicion-Inmuebles",
                    "title": "Condición Inmuebles",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10914,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10915,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16426,
                    "path": "Bandeja-Criticidad-Inmuebles",
                    "title": "Criticidad",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16425,
                    "path": "Bandeja-Areas-Comunes",
                    "title": "Nombre de Áreas Comunes",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16423,
                    "path": "Bandeja-Situacion-Inmuebles",
                    "title": "Situación de Inmuebles",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16424,
                    "path": "Bandeja-Sub-Situacion-Inmuebles",
                    "title": "Sub Situación de Inmuebles",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16422,
                    "path": "Bandeja-Uso-Especifico-Inmuebles",
                    "title": "Uso Específico de Inmuebles",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16421,
                    "path": "Bandeja-Uso-Generico-Inmuebles",
                    "title": "Uso Genérico de Inmuebles",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 16298,
                "path": "/ParametrosMantenimiento",
                "title": "Parámetros Mantenimiento",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "ParámetrosMantenimiento",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16445,
                    "path": "Bandeja-Control-Presupuestal",
                    "title": "Control Presupuestal",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16303,
                    "path": "Bandeja-Grupo-Mantenimiento",
                    "title": "Grupos de Mantenimiento",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 11000,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11001,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11002,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11003,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11004,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16509,
                    "path": "Bandeja-Tiempos-Atencion",
                    "title": "Tiempos de Atención",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 11038,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11039,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11040,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11041,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16304,
                    "path": "Bandeja-Tipo-Solicitud",
                    "title": "Tipo de Solicitud",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 11005,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11006,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11007,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11008,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11009,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16302,
                    "path": "Bandeja-Unidad-Mantenimiento",
                    "title": "Unidad de Mantenimiento",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10995,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10996,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10997,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10998,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10999,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16427,
                    "path": "Bandeja-Zonales-OT",
                    "title": "Zonales de OT",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 8213,
                "path": "bandpiso",
                "title": "Pisos",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "PS",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 16431,
                "path": "/Tablas-Mantenimiento",
                "title": "Tabla Mantenimiento",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "TablaMantenimiento",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16434,
                    "path": "Bandeja-Clientes",
                    "title": "Clientes ",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10936,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10937,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10938,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10939,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11011,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16436,
                    "path": "Bandeja-Feriados",
                    "title": "Feriados ",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16448,
                    "path": "Bandeja-Proveedores",
                    "title": "Proveedores",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10968,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10969,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10970,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10971,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11012,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16432,
                    "path": "Bandeja-Zonales",
                    "title": "Zonales",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 10928,
                        "nombre": "Activar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10929,
                        "nombre": "Eliminar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10930,
                        "nombre": "Nuevo",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 10931,
                        "nombre": "Desactivar",
                        "descripcion": null,
                        "elemento": null
                      },
                      {
                        "id": 11010,
                        "nombre": "Guardar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 16415,
                "path": "Bandeja-Tarifario-Servicios",
                "title": "Tarifario de Servicios",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": [
                  {
                    "id": 10905,
                    "nombre": "Activar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10906,
                    "nombre": "Desactivar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10907,
                    "nombre": "Eliminar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10908,
                    "nombre": "Nuevo",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 11015,
                    "nombre": "Guardar",
                    "descripcion": null,
                    "elemento": null
                  }
                ]
              },
              {
                "id": 16447,
                "path": "Bandeja-Tarifario-Materiales",
                "title": "Tarifario Materiales",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": [
                  {
                    "id": 10964,
                    "nombre": "Activar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10965,
                    "nombre": "Desactivar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10966,
                    "nombre": "Eliminar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10967,
                    "nombre": "Nuevo",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 11016,
                    "nombre": "Guardar",
                    "descripcion": null,
                    "elemento": null
                  }
                ]
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 16412,
            "path": "alquileres/",
            "title": "\t\r\nAlquileres y SSPP",
            "descripcion": null,
            "type": "sub",
            "icontype": null,
            "movil": false,
            "collapse": "AlquileresySSPP",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 16451,
                "path": "",
                "title": "Alquileres",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "Alquileres",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16306,
                    "path": "consultaalquiler",
                    "title": "Búsqueda Alquiler",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16309,
                    "path": "consultaequivalencia",
                    "title": "Búsqueda Equivalencia SKU",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16307,
                    "path": "cargamasivaalquiler",
                    "title": "Carga Masv. Alquileres",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16308,
                    "path": "registroalquiler",
                    "title": "Registro Alquiler",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 16452,
                "path": "",
                "title": "SSPP",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "SSPP",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16454,
                    "path": "",
                    "title": "Consulta",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16456,
                    "path": "Dashboard-SSPP",
                    "title": "Dashboard",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16453,
                    "path": "",
                    "title": "Registro",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16455,
                    "path": "",
                    "title": "Reportes",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8216,
            "path": "/distribucion",
            "title": "Distribución",
            "descripcion": null,
            "type": "sub",
            "icontype": "apps",
            "movil": false,
            "collapse": "Distribución",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8219,
                "path": "actualizacionmasiva",
                "title": "Actualización masiva",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "AM",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8220,
                "path": "consultaordenes",
                "title": "Consulta de solicitudes",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "CO",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8217,
                "path": "missolicitudes",
                "title": "Mis solicitudes",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "MS",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8218,
                "path": "regdistribucion",
                "title": "Registro de ticket",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "RS",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8221,
                "path": "reportes",
                "title": "Reportes",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "R",
                "principal": false,
                "children": [],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8253,
            "path": "Equipos",
            "title": "Equipos",
            "descripcion": null,
            "type": "sub",
            "icontype": null,
            "movil": false,
            "collapse": "Equipos",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8254,
                "path": "Bandeja-Equipos",
                "title": "Bandeja-Equipos",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8255,
                "path": "Registrar-Equipos",
                "title": "Registrar-Equipos",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 16256,
            "path": "/flotavehicular",
            "title": "Flota vehicular",
            "descripcion": null,
            "type": "sub",
            "icontype": null,
            "movil": false,
            "collapse": "Flotavehicular",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 16257,
                "path": "/configuracion",
                "title": "Configuración",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "Configuracion",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16260,
                    "path": "consultagrupomantenimiento",
                    "title": "Grupos de Mantenimiento",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16261,
                    "path": "consultamantepreventivo",
                    "title": "Mantenimiento Preventivo",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16258,
                    "path": "consultaoperario",
                    "title": "Operarios",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16262,
                    "path": "consultaplantillavehicular",
                    "title": "Plantilla Vehicular",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16259,
                    "path": "consultaatencionvehicular",
                    "title": "Tiempo Atención Vehicular",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16263,
                    "path": "consultaunidadmantenimiento",
                    "title": "Unidad Mantenimiento",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 16264,
                "path": "/gestionvehicular",
                "title": "Gestión Vehicular",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "gestionvehicular",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16268,
                    "path": "consultachecklist",
                    "title": "CheckList",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16271,
                    "path": "consultaasigvehicular",
                    "title": "Consulta Asig Vehicular",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16269,
                    "path": "consultaconsumocombustible",
                    "title": "Consumo Combustible",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16273,
                    "path": "consultacontratos",
                    "title": "Contratos",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16270,
                    "path": "consultacontrolvehicular",
                    "title": "Control Vehicular",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16267,
                    "path": "consultagastosrenting",
                    "title": "Gastos Renting",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16265,
                    "path": "consultainventariovehicular",
                    "title": "Inventario Vehicular",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16266,
                    "path": "consultarecobros",
                    "title": "Recobros",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16272,
                    "path": "consultavales",
                    "title": "Vales",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 16274,
                "path": "/mantenimientovehicular",
                "title": "Mantenimiento Vehicular",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "mantenimientovehicular",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16275,
                    "path": "consultamantenimientovehicular",
                    "title": "Mantenimiento Vehicular",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8182,
            "path": "materiales",
            "title": "Materiales",
            "descripcion": null,
            "type": "sub",
            "icontype": "apps",
            "movil": false,
            "collapse": "GestiondeMateriales",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8183,
                "path": "bandejaAlmacenes",
                "title": "Almacenes",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "BA",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8184,
                "path": "bandejaMateriales",
                "title": "Materiales",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "RG",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8256,
                "path": "bandejaMaterialesAlmacen",
                "title": "Materiales por Almacén",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "MA",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 16293,
                "path": "RegistroMovimientosMateriales",
                "title": "Movimiento de Materiales",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "BA",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 16295,
                "path": "bandejaAprobacionKardex",
                "title": "Pendiente de Aprobación Kardex",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "BA",
                "principal": false,
                "children": [],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 16465,
            "path": "/inspecciones",
            "title": "Gestión de Inspección",
            "descripcion": null,
            "type": "sub",
            "icontype": null,
            "movil": false,
            "collapse": "GestióndeInspección",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 16476,
                "path": "/edificios",
                "title": "Edificios",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "Edificios",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 16468,
                    "path": "bandejainspecciones",
                    "title": "Inspecciones",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16467,
                    "path": "bandejaplanificacion",
                    "title": "Planificación",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16466,
                    "path": "bandejaplantilla",
                    "title": "Plantilla",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": [
                      {
                        "id": 11035,
                        "nombre": "Editar",
                        "descripcion": null,
                        "elemento": null
                      }
                    ]
                  },
                  {
                    "id": 16469,
                    "path": "reporteinspecciones",
                    "title": "Reporte Inspecciones",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": null,
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8223,
            "path": "/telef",
            "title": "Telefonía",
            "descripcion": null,
            "type": "sub",
            "icontype": "apps",
            "movil": false,
            "collapse": "GestióndeTelefonia",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8225,
                "path": "bandSolicitud",
                "title": "Bandeja Solicitud",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "CT",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8224,
                "path": "regTicket",
                "title": "Registro de Solicitud",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "T",
                "principal": false,
                "children": [],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8202,
            "path": "/calculadora",
            "title": "Gestión de activos",
            "descripcion": null,
            "type": "sub",
            "icontype": "apps",
            "movil": false,
            "collapse": "Gestióndeactivos",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8203,
                "path": "confiabilidad",
                "title": "Calculadora",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "C",
                "principal": false,
                "children": [],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8228,
            "path": "/inmueble",
            "title": "Inmuebles",
            "descripcion": null,
            "type": "sub",
            "icontype": "apps",
            "movil": false,
            "collapse": "Inmuebles",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 16409,
                "path": "Bandeja-Traslados",
                "title": "Bandeja Traslados",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 16407,
                "path": "Bandeja-Mobiliario",
                "title": "Bandeja-Mobiliario",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8230,
                "path": "consultainmueble",
                "title": "Consulta de Inmueble",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "CI",
                "principal": false,
                "children": [],
                "listAcciones": [
                  {
                    "id": 11036,
                    "nombre": "CargaMasiva",
                    "descripcion": null,
                    "elemento": null
                  }
                ]
              },
              {
                "id": 16477,
                "path": "https://white-tree-0352bc60f.6.azurestaticapps.net/RedirectLogin",
                "title": "Equipos Asignados",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 16408,
                "path": "Registrar-Mobiliario",
                "title": "Registrar-Mobiliario",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 16410,
                "path": "Registrar-Traslado",
                "title": "Registrar-Traslado",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8229,
                "path": "registroinmueble",
                "title": "Registro de Inmueble",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "RI",
                "principal": false,
                "children": [],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8239,
            "path": "Obras",
            "title": "Obras",
            "descripcion": null,
            "type": "sub",
            "icontype": null,
            "movil": false,
            "collapse": "ObrasMenores",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8241,
                "path": "Bandeja-Obras",
                "title": "Consulta de Obras",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "CT",
                "principal": false,
                "children": [],
                "listAcciones": [
                  {
                    "id": 10870,
                    "nombre": "Nuevo",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10871,
                    "nombre": "Registrar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10873,
                    "nombre": "Activar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10875,
                    "nombre": "Subir",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10881,
                    "nombre": "Ver",
                    "descripcion": null,
                    "elemento": null
                  }
                ]
              },
              {
                "id": 16294,
                "path": "Dashboard-Obra",
                "title": "Dashboard",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8251,
                "path": "Registrar-Obra",
                "title": "Nueva Solicitud",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": [
                  {
                    "id": 10872,
                    "nombre": "Editar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10874,
                    "nombre": "Descargar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10876,
                    "nombre": "Aprobar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10877,
                    "nombre": "Recharzar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10878,
                    "nombre": "Devolver",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10879,
                    "nombre": "Registrar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10880,
                    "nombre": "Subir",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10883,
                    "nombre": "Eliminar Archivo",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10884,
                    "nombre": "Eliminar Item",
                    "descripcion": null,
                    "elemento": null
                  }
                ]
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8231,
            "path": "planificados",
            "title": "Mantenimiento planificado",
            "descripcion": null,
            "type": "sub",
            "icontype": null,
            "movil": false,
            "collapse": "Planificado",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8235,
                "path": "BandejaCalendarioTrabajoPlanificado",
                "title": "Calendario Trabajo Planificados",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "CT",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8233,
                "path": "BandejaPlanesProgramacion",
                "title": "Planes de Programacion",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "CT",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8232,
                "path": "BandejaPoliticaMantenimiento",
                "title": "Politicas de Mantenimiento",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "CT",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8234,
                "path": "BandejaTrabajosPlanificados",
                "title": "Trabajos Planificados",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "CT",
                "principal": false,
                "children": [],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 16310,
            "path": "reportes",
            "title": "Reporteria",
            "descripcion": null,
            "type": "sub",
            "icontype": null,
            "movil": false,
            "collapse": "Reportes",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 5589,
                "path": "/alquileres",
                "title": "Alquileres",
                "descripcion": null,
                "type": "sub",
                "icontype": "",
                "movil": false,
                "collapse": "Alquileres",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 1,
                    "path": "alquileresproximosvencer",
                    "title": "Alquileres Proximos a Vencer",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 3,
                    "path": "contratoscerrados",
                    "title": "Contratos Cerrados",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 8,
                    "path": "cronogramaordenpagoalquiler",
                    "title": "Cronograma Orden de Pago",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 12,
                    "path": "historialversionesalquiler",
                    "title": "Historial de Versiones",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 14,
                    "path": "informeincrementorenta",
                    "title": "Informe de Incremento de Renta",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 17,
                    "path": "listadoalquileres",
                    "title": "Listado de Alquileres",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 21,
                    "path": null,
                    "title": "Pago de Fondo de Promoción",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 22,
                    "path": "pagorentagerencia",
                    "title": "Pago de Rentas por Gerencia",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 23,
                    "path": "pagosporgerencia",
                    "title": "Plan de Pago por Gerencia",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 5761,
                "path": "/flotavehicular",
                "title": "Flota Vehicular",
                "descripcion": null,
                "type": "sub",
                "icontype": "",
                "movil": false,
                "collapse": "FlotaVehicular",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 24,
                    "path": null,
                    "title": "prueba",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 8070,
                "path": "Reporte",
                "title": "Gestion de Limpieza",
                "descripcion": null,
                "type": "sub",
                "icontype": "",
                "movil": false,
                "collapse": "GestiondeLimpieza",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 13,
                    "path": null,
                    "title": "Horario Operario",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 20,
                    "path": null,
                    "title": "OPERARIOS DE LIMPIEZA",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 1459,
                "path": "/inmuebles",
                "title": "Inmuebles",
                "descripcion": null,
                "type": "sub",
                "icontype": "",
                "movil": false,
                "collapse": "Inmuebles",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 18,
                    "path": "listadoinmueble",
                    "title": "Listado de Inmuebles",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 26,
                    "path": "prorrateoxareainmobiliaria",
                    "title": "Reporte de Prorrateos",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 1467,
                "path": "Reporte",
                "title": "Inspecciones",
                "descripcion": null,
                "type": "sub",
                "icontype": "",
                "movil": false,
                "collapse": "Inspecciones",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 4,
                    "path": null,
                    "title": "Control de Inspecciones",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 1466,
                "path": "/materiales",
                "title": "Materiales",
                "descripcion": null,
                "type": "sub",
                "icontype": "",
                "movil": false,
                "collapse": "Materiales",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 2,
                    "path": "catalogomateriales",
                    "title": "Catálogo de Materiales",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 15,
                    "path": "reporteinventariovalorizado",
                    "title": "Inventario Valorizado",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 5652,
                "path": "/mobiliarios",
                "title": "Mobiliarios",
                "descripcion": null,
                "type": "sub",
                "icontype": "",
                "movil": false,
                "collapse": "Mobiliarios",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 19,
                    "path": "mobiliarioporsolicitudes",
                    "title": "Mobiliarios por Solicitudes",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 28,
                    "path": "reportemobiliarios",
                    "title": "Reporte Mobiliarios",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 35,
                    "path": "trasladosmobiliarios",
                    "title": "Traslados de Mobiliarios",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 1462,
                "path": "/planificados",
                "title": "Planificados",
                "descripcion": null,
                "type": "sub",
                "icontype": "",
                "movil": false,
                "collapse": "Planificados",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 32,
                    "path": "solicitudesplanificadas",
                    "title": "Solicitudes Planificadas",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 33,
                    "path": "solicitudesplanificadasclientes",
                    "title": "Solicitudes Planificadas Cliente",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 5733,
                "path": "Reporte",
                "title": "Rentas Internas",
                "descripcion": null,
                "type": "sub",
                "icontype": "",
                "movil": false,
                "collapse": "RentasInternas",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 9,
                    "path": null,
                    "title": "Gastos Generales",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 34,
                    "path": null,
                    "title": "Total costo",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 5795,
                "path": "Reporte",
                "title": "Servicio Publicos",
                "descripcion": null,
                "type": "sub",
                "icontype": "",
                "movil": false,
                "collapse": "ServicioPublicos",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 5,
                    "path": null,
                    "title": "Control de Pagos",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 6,
                    "path": null,
                    "title": "Control de Seguimiento",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 10,
                    "path": null,
                    "title": "Gráfica de Control de Agua Potable",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 11,
                    "path": null,
                    "title": "Gráfica de Control de Energía Eléctrica",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16,
                    "path": null,
                    "title": "Lectua de Medidores",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 29,
                    "path": null,
                    "title": "SKU",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 36,
                    "path": null,
                    "title": "Variación Consumo Agua Potable",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 37,
                    "path": null,
                    "title": "Variación Consumo Energia Electrica",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              },
              {
                "id": 16361,
                "path": "/solicitudestrabajo",
                "title": "Solicitudes de Trabajo",
                "descripcion": null,
                "type": "sub",
                "icontype": null,
                "movil": false,
                "collapse": "solicitudestrabajo",
                "ab": null,
                "principal": false,
                "children": [
                  {
                    "id": 7,
                    "path": "reporteGeneral1/,EDI,REPORTES,Reportes,REPORTESOLICITUDESPSPTO,CONTROL PRESUPUESTAL",
                    "title": "Control presupuestos",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16367,
                    "path": "gastosdeserviciosymateriales",
                    "title": "Gastos de Servicios y Materiales",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16450,
                    "path": "reportelogaccionsolicitud",
                    "title": "Log Acciones",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 25,
                    "path": "reportereglaasignacionsubreporte",
                    "title": "Regla de Asignación",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 27,
                    "path": "reportetecnicos",
                    "title": "Reporte de Tecnicos",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16369,
                    "path": "reportesku",
                    "title": "Reporte SKU",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 30,
                    "path": "solicitudesademanda",
                    "title": "Solicitudes a Demanda",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16364,
                    "path": "solicitudesadjuntos",
                    "title": "Solicitudes Adjuntos",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 31,
                    "path": "reportesolicitudestrabajousuario",
                    "title": "Solicitudes de Trabajo a Demanda Usuario",
                    "descripcion": null,
                    "type": "link",
                    "icontype": "",
                    "movil": false,
                    "collapse": null,
                    "ab": "",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16365,
                    "path": "solicitudesdemandacliente",
                    "title": "Solicitudes Demanda Cliente",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16363,
                    "path": "tarifadosdeserviciosymateriales",
                    "title": "Tarifados de Servicios y Materiales",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  },
                  {
                    "id": 16368,
                    "path": "valoracionservicios",
                    "title": "Valoración Servicios",
                    "descripcion": null,
                    "type": "link",
                    "icontype": null,
                    "movil": false,
                    "collapse": null,
                    "ab": "CT",
                    "principal": false,
                    "children": [],
                    "listAcciones": []
                  }
                ],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 16438,
            "path": "Service-Desk",
            "title": "Service Desk ",
            "descripcion": null,
            "type": "sub",
            "icontype": null,
            "movil": false,
            "collapse": "ServiceDesk",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 16440,
                "path": "Bandeja-Oportunidades-Mejora",
                "title": "Búsqueda de Oportunidades de Mejora",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": [
                  {
                    "id": 10953,
                    "nombre": "Nuevo",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10954,
                    "nombre": "Desestimar",
                    "descripcion": null,
                    "elemento": null
                  }
                ]
              },
              {
                "id": 16437,
                "path": "Bandeja-Ticket",
                "title": "Consulta de Tickets Service Desk ",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": [
                  {
                    "id": 10944,
                    "nombre": "Nuevo",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10945,
                    "nombre": "Desestimar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 11037,
                    "nombre": "Editar",
                    "descripcion": null,
                    "elemento": null
                  }
                ]
              },
              {
                "id": 16439,
                "path": "Registrar-Ticket",
                "title": "Registro de Tickets Service Desk ",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": [
                  {
                    "id": 10946,
                    "nombre": "Editar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10947,
                    "nombre": "Guardar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10948,
                    "nombre": "Observacion",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10949,
                    "nombre": "Adjunto",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10950,
                    "nombre": "Desestimar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10951,
                    "nombre": "Atender",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10952,
                    "nombre": "Derivar",
                    "descripcion": null,
                    "elemento": null
                  }
                ]
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8177,
            "path": "/solicitud",
            "title": "Solicitudes de atención",
            "descripcion": null,
            "type": "sub",
            "icontype": "apps",
            "movil": false,
            "collapse": "SolicitudesdeTrabajo",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8179,
                "path": "bandejasolicitud",
                "title": "Consulta de solicitud",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "CS",
                "principal": false,
                "children": [],
                "listAcciones": [
                  {
                    "id": 10869,
                    "nombre": "Nuevo",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10888,
                    "nombre": "Reiniciar",
                    "descripcion": null,
                    "elemento": null
                  },
                  {
                    "id": 10889,
                    "nombre": "Ver todos los adjuntos",
                    "descripcion": null,
                    "elemento": null
                  }
                ]
              },
              {
                "id": 8250,
                "path": "bandejaSolicitudMasivo",
                "title": "Operaciones masivas",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": null,
                "principal": false,
                "children": [],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8200,
            "path": "/wibee",
            "title": "Reportes wibeee",
            "descripcion": null,
            "type": "sub",
            "icontype": "apps",
            "movil": false,
            "collapse": "graficoswibeee",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8201,
                "path": "tablero",
                "title": "Wibeee",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "W",
                "principal": false,
                "children": [],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8195,
            "path": "/iot",
            "title": "Monitoreo IoT",
            "descripcion": null,
            "type": "sub",
            "icontype": "apps",
            "movil": false,
            "collapse": "iot",
            "ab": null,
            "principal": false,
            "children": [
              {
                "id": 8198,
                "path": "agregarImagen",
                "title": "Asignar Imagenes",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "AI",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8197,
                "path": "bandejaconfiguracion",
                "title": "Bandeja Configuración",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "BC",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8196,
                "path": "regconfiguracion",
                "title": "Configuracion",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "C",
                "principal": false,
                "children": [],
                "listAcciones": []
              },
              {
                "id": 8199,
                "path": "geolocalizacion",
                "title": "Geolocalización",
                "descripcion": null,
                "type": "link",
                "icontype": null,
                "movil": false,
                "collapse": null,
                "ab": "G",
                "principal": false,
                "children": [],
                "listAcciones": []
              }
            ],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8226,
            "path": "https://apps.sistemaedi.com.pe",
            "title": "Contrataciones",
            "descripcion": null,
            "type": "link",
            "icontype": "apps",
            "movil": false,
            "collapse": null,
            "ab": null,
            "principal": false,
            "children": [],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 16411,
            "path": "licencias/consultaLicencia",
            "title": "Licencias y Saneamiento",
            "descripcion": null,
            "type": "link",
            "icontype": null,
            "movil": false,
            "collapse": null,
            "ab": null,
            "principal": false,
            "children": [],
            "listAcciones": [
              {
                "id": 10961,
                "nombre": "Nuevo",
                "descripcion": null,
                "elemento": null
              },
              {
                "id": 10962,
                "nombre": "Guardar",
                "descripcion": null,
                "elemento": null
              }
            ],
            "favorite": false
          },
          {
            "id": 16497,
            "path": "Tablero Mando Geseco*1cbb0b0e-3a58-4159-8e5c-704b454aa82b",
            "title": "Tablero de Mando Geseco",
            "descripcion": null,
            "type": "link",
            "icontype": null,
            "movil": false,
            "collapse": null,
            "ab": null,
            "principal": false,
            "children": [],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 16489,
            "path": "Tablero Mando*[{\"lstclientes\":[97],\"descripcion\":\"COLEGIOS PERUANOS\",\"rutaBi\":\"a91e7bf8-229f-4c65-afe7-3fad7fd1be52\"},{\"lstclientes\":[12],\"descripcion\":\"INTERBANK\",\"rutaBi\":\"714aee6d-8325-402d-b04d-a4a3d5fb0db4\"}]",
            "title": "Tablero de Mando Interno",
            "descripcion": null,
            "type": "link",
            "icontype": null,
            "movil": false,
            "collapse": null,
            "ab": null,
            "principal": false,
            "children": [],
            "listAcciones": [],
            "favorite": false
          },
          {
            "id": 8227,
            "path": "Tablero Mando*[{\"lstclientes\":[1],\"descripcion\":\"TELEFONICA\",\"rutaBi\":\"99a2ff6b-a6f5-4a06-b00a-4eee74ba1c2d\"},{\"lstclientes\":[12],\"descripcion\":\"Ibk\",\"rutaBi\":\"306cad40-9af4-4994-b9a7-25cabbc93b9b\"},{\"lstclientes\":[19,30],\"descripcion\":\"pichincha y dinners\",\"rutaBi\":\"4e90edd9-7e86-42ea-9589-2769720d485d\"},{\"lstclientes\":[33],\"descripcion\":\"STATKRAFT\",\"rutaBi\":\"b0e5edca-9dd5-4214-9fbe-20bface5136f\"},{\"lstclientes\":[40,42],\"descripcion\":\"SCOTIABANK\",\"rutaBi\":\"9e6f4a53-a85b-4814-a1e2-98bbbb7ba13c\"},{\"lstclientes\":[41],\"descripcion\":\"CREDISCOTIA\",\"rutaBi\":\"d7008f68-1009-4bad-9b9a-d5f7c9ef97bf\"},{\"lstclientes\":[48],\"descripcion\":\"BBVA\",\"rutaBi\":\"dbc88394-3e08-4000-b57a-6ccc2c783523\"},{\"lstclientes\":[51,52,53,54,55,56],\"descripcion\":\"conecta\",\"rutaBi\":\"9f1f59f5-c56c-4e3d-8d52-0b3f93ed8647\"},{\"lstclientes\":[62],\"descripcion\":\"MIBanco\",\"rutaBi\":\"896abdbd-dcef-410d-8bba-fe412a359c92\"},{\"lstclientes\":[65],\"descripcion\":\"BANCO FALABELLA PERU S.A\",\"rutaBi\":\"9058acf3-2f33-4839-bf12-772b1e921110\"},{\"lstclientes\":[71],\"descripcion\":\"Ripley\",\"rutaBi\":\"3ae61a81-8d73-463a-8cbb-f2f26dcee012\"},{\"lstclientes\":[72],\"descripcion\":\"BANCO RIPLEY\",\"rutaBi\":\"77828212-f3ac-40c2-8b28-1d36dfc3e725\"},{\"lstclientes\":[83,85,86,87],\"descripcion\":\"ENEL\",\"rutaBi\":\"dac6f0bc-628f-466f-bfd2-ea3025e4f5c8\"},{\"lstclientes\":[96],\"descripcion\":\"COMPAÑIA FOOD RETAIL S.A.C\",\"rutaBi\":\"c17fd9ce-0fb5-4336-b417-61007147b57d\"},{\"lstclientes\":[97],\"descripcion\":\"Colegios Peruanos\",\"rutaBi\":\"39fc0b42-39c2-4a25-9711-df4619e226b4\"},{\"lstclientes\":[120],\"descripcion\":\"Comunidad Andina\",\"rutaBi\":\"e008d6ec-10b8-47ee-b747-1b35a7bcfc6f\"},{\"lstclientes\":[21],\"descripcion\":\"TGDEMO\",\"rutaBi\":\"c978e2f9-424a-4611-882a-ef4e0235d9e9\"}]",
            "title": "Tablero Mando",
            "descripcion": null,
            "type": "link",
            "icontype": null,
            "movil": false,
            "collapse": null,
            "ab": null,
            "principal": false,
            "children": [],
            "listAcciones": [],
            "favorite": false
          }
        ]
      }));

    },);




    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });


    console.log(`2. Respuesta del servidor: ${response.status()} ${response.statusText()}`);
    if (response.status() >= 400) {
      throw new Error(`El servidor rechazó la URL con error: ${response.status()}`);
    }
    try {
      await page.waitForSelector(selector, { visible: true, timeout: 15000 });
      console.log("✅ Selector encontrado!");
    } catch (e) {
      await page.screenshot({ path: 'debug_error.png', fullPage: true });

      const htmlContent = await page.content();
      fs.writeFileSync('debug_dom.html', htmlContent);
      throw new Error(`Timeout esperando ${selector}. Revisa debug_error.png`);
    }
    const html = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.outerHTML : null;
    }, selector);
    await browser.close();
    res.json({ success: true, html });

  } catch (err) {
    console.error("Error:", err.message);
    if (browser) await browser.close();
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor listo en http://localhost:3000");
});