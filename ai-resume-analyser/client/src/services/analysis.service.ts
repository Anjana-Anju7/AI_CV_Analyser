import api from './api';

export const analysisService = {
  submit: (file: File, jobDescription: string) => {
    const form = new FormData();
    form.append('resume', file);
    form.append('jobDescription', jobDescription);
    return api.post('/analyses', form).then((r) => r.data);
  },

  getOne: (id: string) => api.get(`/analyses/${id}`).then((r) => r.data),

  getHistory: (page = 1, limit = 10) =>
    api.get('/analyses', { params: { page, limit } }).then((r) => r.data),

  rewriteBullet: (analysisId: string, bullet: string, jobDescription?: string) =>
    api
      .post(`/analyses/${analysisId}/rewrite`, { bullet, jobDescription })
      .then((r) => r.data),

  exportPDF: (id: string) =>
    api
      .get(`/analyses/${id}/export`, { responseType: 'blob' })
      .then((r) => {
        const blob = new Blob([r.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }),

  share: (id: string) => api.post(`/analyses/${id}/share`).then((r) => r.data),
};

export const jdService = {
  getAll: () => api.get('/jds').then((r) => r.data),
  create: (title: string, description: string, company?: string) =>
    api.post('/jds', { title, description, company }).then((r) => r.data),
  delete: (id: string) => api.delete(`/jds/${id}`),
};
