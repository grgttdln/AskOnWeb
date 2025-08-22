import numpy as np

class InMemoryVectorStore:
    def __init__(self):
        self.vectors = []  # list of numpy arrays
        self.texts = []

    def add(self, text, vector):
        self.texts.append(text)
        self.vectors.append(np.array(vector))

    def search(self, query_vector, top_k=1):
        sims = [np.dot(query_vector, v)/(np.linalg.norm(query_vector)*np.linalg.norm(v)) for v in self.vectors]
        top_indices = np.argsort(sims)[::-1][:top_k]
        return [(self.texts[i], sims[i]) for i in top_indices]
