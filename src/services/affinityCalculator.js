export class AffinityCalculator {
  constructor() {
    this.maxScoreUniqueMatch = 3.0;
    this.weights = {
      exactMatch: 1.0,        // Para coincidencia exacta
      superiorMatch: 1.3,     // Bonus por superar el nivel requerido
      criticalSkill: 1.5,     // Bonus para habilidades críticas (nivel 4-5)
      coverageBonus: 1.2,     // Bonus por alta cobertura
      experienceBonus: 1.15,  // Bonus por experiencia superior
      consistencyBonus: 1.1,  // Bonus por consistencia en múltiples habilidades
      educationBonus: 1.2,    // Bonus por educación relevante
      experienceYearsBonus: 1.1, // Bonus por años de experiencia
      profamilyMatchBonus: 1.3    // Bonus por coincidencia de familia profesional
    };

    //  OPTIMIZACIÓN: Cache para mejorar performance en cálculos repetidos
    this.cache = new Map();
    this.cacheSize = 1000;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  calculateAffinity(companySkills, studentSkills, options = {}) {
    //  OPTIMIZACIÓN: Cache de resultados para estudiantes similares
    const cacheKey = this._generateCacheKey(companySkills, studentSkills, options);
    if (this.cache.has(cacheKey)) {
      this.cacheHits++;
      return this.cache.get(cacheKey);
    }
    this.cacheMisses++;

    const { profamilyId = null, offerProfamilyIds = [], academicVerificationStatus = 'unverified' } = options;

    // 🔥 NUEVO: Calcular afinidad de familia profesional PRIMERO (tiene más peso)
    const profamilyAffinity = this._calculateProfamilyAffinity(profamilyId, offerProfamilyIds, academicVerificationStatus);

    let score = 0;
    let matches = 0;
    let matchingSkills = [];
    let hasPremiumMatch = false;
    let hasValue2Match = 0;
    let hasSuperiorRating = 0;
    let proportionalFactor = 1;
    let specialUniqueMatch = false;
    let coverageFactor = 1;
    let criticalSkillsMatched = 0;
    let consistencyScore = 0;

    // Obtener totales
    const totalCompanySkills = Object.keys(companySkills).length;
    const totalStudentSkills = Object.keys(studentSkills).length;

    if (totalCompanySkills === 0) {
      // 🔥 NUEVO: Si no hay skills requeridos, el score base depende solo de profamily
      const baseScore = profamilyAffinity.score * 5; // Score base de 5 si coincide profamily
      return this._createAffinityResult(baseScore, 0, 0, [], { profamilyAffinity });
    }

    // 🔥 NUEVO: El score base ahora depende principalmente de la coincidencia de profamily
    let baseScore = 0;

    // Si hay coincidencia de profamily, score base alto
    if (profamilyAffinity.level === "exact_match") {
      baseScore = 7.0; // Score base alto por coincidencia de profamily
    } else if (profamilyAffinity.level === "related_match") {
      baseScore = 5.0; // Score base medio por profamily relacionada
    } else {
      baseScore = 2.0; // Score base bajo sin coincidencia de profamily
    }

    //  OPTIMIZACIÓN: Pre-clasificar habilidades por importancia
    const skillsByImportance = this._classifySkillsByImportance(companySkills);

    //  OPTIMIZACIÓN: Calcular coincidencias con algoritmo mejorado
    for (const [skill, companyLevel] of Object.entries(companySkills)) {
      if (studentSkills[skill]) {
        const studentLevel = studentSkills[skill];
        matches++;

        const skillMatch = {
          skill,
          companyLevel,
          studentLevel,
          match: studentLevel >= companyLevel,
          excess: Math.max(0, studentLevel - companyLevel),
          importance: this._getSkillImportance(companyLevel)
        };

        matchingSkills.push(skillMatch);

        //  OPTIMIZACIÓN: Sistema de puntuación más sofisticado
        let skillScore = this._calculateSkillScore(skillMatch);

        // Aplicar bonificaciones especiales
        if (companyLevel >= 4) {
          hasPremiumMatch = true;
          criticalSkillsMatched++;
          skillScore *= this.weights.criticalSkill;
        }

        if (companyLevel === 2) hasValue2Match++;

        if (studentLevel > companyLevel) {
          hasSuperiorRating++;
          skillScore *= this.weights.superiorMatch;
        }

        //  OPTIMIZACIÓN: Bonus por consistencia en habilidades importantes
        if (companyLevel >= 3 && studentLevel >= companyLevel) {
          consistencyScore += 1;
        }

        score += skillScore;
      } else {
        //  OPTIMIZACIÓN: Penalización más inteligente para habilidades faltantes
        const missingPenalty = this._calculateMissingSkillPenalty(companyLevel, totalCompanySkills);
        score -= missingPenalty;
      }
    }

    //  OPTIMIZACIÓN: Factores mejorados de cobertura y proporcionalidad
    coverageFactor = matches / totalCompanySkills;

    // Factor proporcional mejorado
    if (totalStudentSkills > totalCompanySkills) {
      const skillRatio = totalStudentSkills / totalCompanySkills;
      proportionalFactor = Math.min(1.3, 1 + (coverageFactor * 0.3));
    }

    //  OPTIMIZACIÓN: Detección mejorada de coincidencia única especial
    if (matches === 1 && totalCompanySkills === 1) {
      const singleSkill = matchingSkills[0];
      if (singleSkill.companyLevel >= 4 && singleSkill.studentLevel >= singleSkill.companyLevel) {
        specialUniqueMatch = true;
        score = Math.min(score * 1.8, this.maxScoreUniqueMatch);
      }
    }

    // 🔥 NUEVO: Combinar score de profamily con score de skills
    // La coincidencia de profamily DOMINA completamente el score
    let finalScore;

    if (profamilyAffinity.level === "exact_match") {
      // 🔥 PROFAMILY EXACTA: Score MUY ALTO independientemente de skills
      // Dar score alto por profamily + bonus por skills coincidentes
      // 🔥 CORRECCIÓN: Multiplicar por el score de verificación (1.6 para verificado, 1.3 para no verificado)
      const profamilyBaseScore = 5.0; // Score base = 5.0
      const verificationMultiplier = profamilyAffinity.score; // 1.6 para verificado, 1.3 para no verificado
      const profamilyScore = profamilyBaseScore * verificationMultiplier; // 8.0 para verificado, 6.5 para no verificado
      const skillBonus = Math.min(score * 0.2, 1.0); // Bonus pequeño por skills (máximo 1.0)
      finalScore = profamilyScore + skillBonus;
    } else if (profamilyAffinity.level === "related_match") {
      // PROFAMILY RELACIONADA: Score medio-alto
      finalScore = Math.max(6.0, baseScore + (score > 0 ? Math.min(score * 0.15, 0.8) : 0));
    } else {
      // SIN PROFAMILY: Score MUY BAJO basado en skills, pero penalizado fuertemente
      finalScore = Math.min(score * 0.3, 2.0); // Máximo 2.0 sin profamily
      finalScore *= coverageFactor * proportionalFactor;
    }

    // Bonificaciones progresivas (reducidas porque profamily ya da score base alto)
    if (hasPremiumMatch && criticalSkillsMatched >= 2) {
      finalScore *= 1.1; // Reducido de criticalSkill
    } else if (hasPremiumMatch) {
      finalScore *= 1.05; // Reducido de experienceBonus
    }

    if (hasValue2Match >= 2) finalScore *= 1.02;
    if (hasSuperiorRating >= 2) finalScore *= 1.05;

    //  OPTIMIZACIÓN: Bonus por consistencia en múltiples habilidades
    if (consistencyScore >= 3) {
      finalScore *= 1.05;
    }

    //  OPTIMIZACIÓN: Bonus por alta cobertura
    if (coverageFactor >= 0.8) {
      finalScore *= 1.1;
    }

    // 🔥 NUEVO: No aplicar profamily bonus aquí porque ya está incluido en baseScore
    // finalScore *= profamilyAffinity.score; // REMOVIDO

    //  OPTIMIZACIÓN: Normalización mejorada con curva logarítmica
    // 🔥 NUEVO: Si hay profamily exact_match, no normalizar tanto
    let normalizedScore;
    if (profamilyAffinity.level === "exact_match") {
      // Para profamily exacta, mantener score alto con normalización mínima
      normalizedScore = Math.min(10, finalScore * 0.9); // Mínima reducción
    } else {
      // Normalización estándar para otros casos
      normalizedScore = this._normalizeScore(finalScore, totalCompanySkills, coverageFactor);
    }

    //  INTEGRACIÓN: Factores expandidos con profamily
    const factors = {
      hasPremiumMatch,
      hasValue2Match,
      hasSuperiorRating,
      criticalSkillsMatched,
      consistencyScore,
      proportionalFactor: Math.round(proportionalFactor * 100) / 100,
      specialUniqueMatch,
      coverageFactor: Math.round(coverageFactor * 100) / 100,
      skillDiversityBonus: totalStudentSkills > totalCompanySkills,
      perfectMatch: matches === totalCompanySkills && hasSuperiorRating === 0,
      profamilyAffinity,
      baseScoreFromProfamily: baseScore
    };

    const result = this._createAffinityResult(
      normalizedScore,
      matches,
      totalCompanySkills,
      matchingSkills,
      factors
    );

    //  OPTIMIZACIÓN: Guardar en cache
    this._cacheResult(cacheKey, result);

    return result;
  }

  //  OPTIMIZACIÓN: Nuevos métodos de apoyo
  _generateCacheKey(companySkills, studentSkills, options = {}) {
    const companyStr = JSON.stringify(companySkills);
    const studentStr = JSON.stringify(studentSkills);
    const optionsStr = JSON.stringify(options);
    return `${companyStr}|${studentStr}|${optionsStr}`;
  }

  _cacheResult(key, result) {
    if (this.cache.size >= this.cacheSize) {
      // Limpiar cache más antiguo (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, result);
  }

  _classifySkillsByImportance(companySkills) {
    const critical = [];
    const important = [];
    const basic = [];

    for (const [skill, level] of Object.entries(companySkills)) {
      if (level >= 4) critical.push(skill);
      else if (level >= 3) important.push(skill);
      else basic.push(skill);
    }

    return { critical, important, basic };
  }

  _getSkillImportance(level) {
    if (level >= 4) return "critical";
    if (level >= 3) return "important";
    return "basic";
  }

  _calculateSkillScore(skillMatch) {
    const { companyLevel, studentLevel, match } = skillMatch;

    if (!match) {
      // Penalización por no cumplir el mínimo
      return companyLevel * 0.3;
    }

    // NUEVAS REGLAS: Puntuación basada en proficiency level del estudiante
    // low (1): 6%, medium (2): 8%, high (3+): 10%
    let proficiencyBonus = 0.06; // Default low
    if (studentLevel >= 3) {
      proficiencyBonus = 0.10; // High proficiency
    } else if (studentLevel >= 2) {
      proficiencyBonus = 0.08; // Medium proficiency
    }

    // Base score por cumplir el requisito mínimo
    let baseScore = companyLevel;

    // Aplicar bonus por exceder el nivel requerido (mantiene lógica existente)
    if (studentLevel > companyLevel) {
      const excess = studentLevel - companyLevel;
      baseScore += excess * 0.5;
    }

    // Aplicar bonus de proficiency
    baseScore *= (1 + proficiencyBonus);

    return baseScore;
  }

  _calculateMissingSkillPenalty(companyLevel, totalSkills) {
    // Penalización más suave para habilidades básicas
    const basePenalty = companyLevel * 0.2;
    const scalingFactor = 1 / Math.sqrt(totalSkills);
    return basePenalty * scalingFactor;
  }

  _normalizeScore(score, totalRequired, coverageFactor) {
    // Normalización mejorada que considera la cobertura
    const baseNormalization = (score / totalRequired) * 2;
    const coverageAdjustment = Math.log(1 + coverageFactor) / Math.log(2);

    return Math.min(10, baseNormalization * coverageAdjustment);
  }

  //  MÉTODO NUEVO: Crear resultado con nivel y explicación
  _createAffinityResult(score, matches, totalRequired, matchingSkills, factors) {
    const roundedScore = Math.round(score * 100) / 100;
    const coverage = Math.round((matches / totalRequired) * 100);

    //  CONVERTIR SCORE A NIVEL
    const level = this._scoreToLevel(roundedScore, coverage);

    //  GENERAR EXPLICACIÓN LEGIBLE
    const explanation = this._generateExplanation(roundedScore, matches, totalRequired, coverage, level);

    return {
      score: roundedScore,
      level,
      matches,
      coverage,
      totalRequired,
      coveragePercentage: coverage,
      matchingSkills,
      explanation,
      factors
    };
  }

  //  OPTIMIZACIÓN: Algoritmo de nivel mejorado con más granularidad
  _scoreToLevel(score, coverage) {
    // Sistema más estricto y balanceado
    if (score >= 8.0 && coverage >= 85) return "muy alto";
    if (score >= 6.5 && coverage >= 75) return "muy alto";
    if (score >= 5.0 && coverage >= 65) return "alto";
    if (score >= 4.0 && coverage >= 55) return "alto";
    if (score >= 3.0 && coverage >= 45) return "medio";
    if (score >= 2.0 && coverage >= 35) return "medio";
    if (score >= 1.0 && coverage >= 20) return "bajo";
    if (score > 0 || coverage > 0) return "bajo";
    return "sin datos";
  }

  //  OPTIMIZACIÓN: Explicaciones más detalladas y útiles
  _generateExplanation(score, matches, totalRequired, coverage, level) {
    if (matches === 0) {
      return "No se encontraron coincidencias en las habilidades requeridas. Considere ampliar los criterios de búsqueda.";
    }

    const baseInfo = `${matches}/${totalRequired} habilidades coincidentes (${coverage}% cobertura)`;

    const explanations = {
      "muy alto": ` ${baseInfo}. Candidato excepcional con excelente afinidad para el puesto. Altamente recomendado para entrevista inmediata.`,
      "alto": ` ${baseInfo}. Candidato sólido con buena afinidad. Recomendado para proceso de selección.`,
      "medio": ` ${baseInfo}. Candidato con potencial moderado. Revisar experiencia específica y considerar entrevista.`,
      "bajo": ` ${baseInfo}. Afinidad limitada. Evaluar si el candidato puede desarrollar habilidades faltantes.`,
      "sin datos": "No se encontraron datos suficientes para evaluar la afinidad. Revisar perfil del candidato."
    };

    return explanations[level] || `${baseInfo}. Puntuación: ${score.toFixed(1)}/10`;
  }

  /**
   *  OPTIMIZACIÓN: Obtener candidatos recomendados con algoritmo mejorado
   */
  findBestCandidates(companySkills, students, options = {}) {
    const {
      minScore = 4.0,           // Score mínimo reducido para más variedad
      limit = 15,               // Límite aumentado
      includeAnalytics = true,  // Incluir métricas adicionales
      diversityBonus = true,    // Bonificar diversidad de perfiles
      offerProfamilyIds = []    //  NUEVO: IDs de familias profesionales de la oferta
    } = options;

    const candidates = students.map(student => {
      // Convertir skills del estudiante al formato esperado por calculateAffinity
      const studentSkills = this._convertStudentSkillsToObject(student);

      const affinity = this.calculateAffinity(
        companySkills,
        studentSkills,
        {
          profamilyId: student.profamilyId,
          offerProfamilyIds: offerProfamilyIds
        }
      );

      //  OPTIMIZACIÓN: Métricas adicionales
      const analytics = includeAnalytics ? {
        skillGap: this._calculateSkillGap(companySkills, studentSkills),
        potentialGrowth: this._calculateGrowthPotential(companySkills, studentSkills),
        uniqueValue: this._calculateUniqueValue(studentSkills, students.map(s => ({ skills: this._convertStudentSkillsToObject(s) })))
      } : {};

      return {
        student,
        affinity,
        analytics,
        recommended: affinity.score >= minScore,
        priority: this._calculatePriority(affinity, analytics)
      };
    });

    //  OPTIMIZACIÓN: Ordenamiento inteligente con múltiples criterios
    candidates.sort((a, b) => {
      // Prioridad principal: score de afinidad
      if (Math.abs(a.affinity.score - b.affinity.score) > 0.5) {
        return b.affinity.score - a.affinity.score;
      }

      // Criterio secundario: prioridad calculada
      if (includeAnalytics && Math.abs(a.priority - b.priority) > 0.1) {
        return b.priority - a.priority;
      }

      // Criterio terciario: cobertura de habilidades
      return b.affinity.coverage - a.affinity.coverage;
    });

    //  OPTIMIZACIÓN: Aplicar bonus de diversidad si está habilitado
    if (diversityBonus && candidates.length > limit) {
      this._applyDiversityBonus(candidates.slice(0, limit * 2));
      candidates.sort((a, b) => b.affinity.score - a.affinity.score);
    }

    const finalCandidates = candidates.slice(0, limit);

    return {
      total: candidates.length,
      recommended: candidates.filter(c => c.recommended).length,
      candidates: finalCandidates,
      analytics: includeAnalytics ? {
        averageScore: this._calculateAverage(candidates.map(c => c.affinity.score)),
        scoreDistribution: this._calculateScoreDistribution(candidates),
        topTierCount: candidates.filter(c => c.affinity.level === "muy alto").length,
        skillCoverageStats: this._calculateSkillCoverageStats(candidates, companySkills)
      } : null
    };
  }

  //  OPTIMIZACIÓN: Nuevos métodos de análisis
  _calculateSkillGap(companySkills, studentSkills) {
    const missing = [];
    const insufficient = [];

    for (const [skill, required] of Object.entries(companySkills)) {
      if (!studentSkills[skill]) {
        missing.push({ skill, required });
      } else if (studentSkills[skill] < required) {
        insufficient.push({
          skill,
          required,
          current: studentSkills[skill],
          gap: required - studentSkills[skill]
        });
      }
    }

    return { missing, insufficient, totalGaps: missing.length + insufficient.length };
  }

  _calculateGrowthPotential(companySkills, studentSkills) {
    let potential = 0;
    let trainableSkills = 0;

    for (const [skill, required] of Object.entries(companySkills)) {
      const current = studentSkills[skill] || 0;
      if (current < required) {
        const gap = required - current;
        if (gap <= 2) { // Habilidades que se pueden desarrollar fácilmente
          trainableSkills++;
          potential += (2 - gap) * 0.5; // Mayor potencial para gaps menores
        }
      }
    }

    return { potential, trainableSkills };
  }

  _calculateUniqueValue(studentSkills, allStudents) {
    const skillCounts = {};

    // Contar frecuencia de cada habilidad
    allStudents.forEach(student => {
      const skills = this._convertStudentSkillsToObject(student);
      Object.keys(skills).forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    let uniqueness = 0;
    Object.keys(studentSkills).forEach(skill => {
      const frequency = skillCounts[skill] / allStudents.length;
      uniqueness += (1 - frequency) * studentSkills[skill]; // Valor por rareza
    });

    return uniqueness;
  }

  _calculatePriority(affinity, analytics) {
    let priority = affinity.score;

    if (analytics.potentialGrowth) {
      priority += analytics.potentialGrowth.potential * 0.2;
    }

    if (analytics.uniqueValue) {
      priority += Math.min(analytics.uniqueValue * 0.1, 1);
    }

    return priority;
  }

  _applyDiversityBonus(candidates) {
    // Aplicar pequeño bonus a candidatos con perfiles únicos
    candidates.forEach(candidate => {
      if (candidate.analytics.uniqueValue > 5) {
        candidate.affinity.score += 0.2;
      }
    });
  }

  _calculateAverage(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  _calculateScoreDistribution(candidates) {
    const distribution = { "muy alto": 0, "alto": 0, "medio": 0, "bajo": 0, "sin datos": 0 };
    candidates.forEach(c => distribution[c.affinity.level]++);
    return distribution;
  }

  _calculateSkillCoverageStats(candidates, companySkills) {
    const skillStats = {};
    const totalSkills = Object.keys(companySkills).length;

    Object.keys(companySkills).forEach(skill => {
      const candidatesWithSkill = candidates.filter(c =>
        c.student.skills && c.student.skills[skill]
      ).length;

      skillStats[skill] = {
        coverage: (candidatesWithSkill / candidates.length) * 100,
        required: companySkills[skill],
        availability: candidatesWithSkill
      };
    });

    return skillStats;
  }

  /**
   *  NUEVO: Método para limpiar cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   *  NUEVO: Método para obtener estadísticas del cache
   */
  getCacheStats() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    return {
      size: this.cache.size,
      maxSize: this.cacheSize,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: totalRequests > 0 ? this.cacheHits / totalRequests : 0
    };
  }

  /**
   *  NUEVO: Método auxiliar para convertir skills del estudiante al formato de objeto
   */
  _convertStudentSkillsToObject(student) {
    const studentSkills = {};

    if (student.cvSkills && student.cvSkills.length > 0) {
      // Nuevo formato: array de CvSkill objects
      student.cvSkills.forEach(cvSkill => {
        const levelMap = {
          "bajo": 1,
          "medio": 2,
          "alto": 3
        };
        studentSkills[cvSkill.skill.name.toLowerCase()] = levelMap[cvSkill.proficiencyLevel] || 1;
      });
    } else if (student.skills && student.skills.length > 0) {
      // Formato antiguo: array de skill objects (para compatibilidad)
      student.skills.forEach(skill => {
        const levelMap = {
          "beginner": 1,
          "intermediate": 2,
          "advanced": 3,
          "expert": 4
        };
        studentSkills[skill.name.toLowerCase()] = levelMap[skill.proficiencyLevel] || 1;
      });
    } else if (student.skills && typeof student.skills === 'object') {
      // Formato legacy: object con skill names como keys
      Object.assign(studentSkills, student.skills);
    }

    return studentSkills;
  }

  /**
   *  NUEVO: Calcular afinidad basada en familia profesional con nuevas reglas
   *  - Same unverified/pending: 30% (score base = 5.0)
   *  - Same verified: 50% (score base = 8.0)
   *  - Related unverified: 20%, Related verified: 40%
   */
  _calculateProfamilyAffinity(profamilyId, offerProfamilyIds, studentVerificationStatus = 'unverified') {
    if (!profamilyId) {
      return { score: 1.0, level: "none", details: "Sin familia profesional definida" };
    }

    if (!offerProfamilyIds || offerProfamilyIds.length === 0) {
      return { score: 1.0, level: "neutral", details: "Oferta sin familias profesionales especificadas" };
    }

    // Verificar si la profamily del estudiante coincide exactamente con alguna de la oferta
    const exactMatch = offerProfamilyIds.includes(profamilyId);

    if (exactMatch) {
      // Coincidencia exacta: depende del estado de verificación
      const isVerified = studentVerificationStatus === 'verified';
      const score = isVerified ? 1.6 : 1.3; // 8.0 vs 5.0 base score (multiplicado por 5 en el cálculo principal)
      return {
        score: score,
        level: "exact_match",
        details: `Familia profesional coincide exactamente (${studentVerificationStatus})`
      };
    }

    // TODO: Implementar lógica para profamilys relacionadas
    // Por ahora, si no hay coincidencia exacta, aplicar penalización leve
    return {
      score: 0.95, // Penalización leve por no coincidir
      level: "no-match",
      details: "Familia profesional no coincide con la oferta"
    };
  }

  /**
   *  NUEVO: Calcular afinidad bidireccional (estudiante -> oferta)
   * Este método calcula qué tan adecuado es un estudiante para una oferta específica
   */
  calculateStudentToOfferAffinity(student, offer) {
    // Extraer skills del estudiante - NUEVA ARQUITECTURA CV SKILLS
    const studentSkills = {};
    if (student.cvSkills && student.cvSkills.length > 0) {
      // Nuevo formato: array de CvSkill objects
      student.cvSkills.forEach(cvSkill => {
        const levelMap = {
          "bajo": 1,
          "medio": 2,
          "alto": 3
        };
        studentSkills[cvSkill.skill.name.toLowerCase()] = levelMap[cvSkill.proficiencyLevel] || 1;
      });
    } else if (student.skills && student.skills.length > 0) {
      // Formato antiguo: array de skill objects (para compatibilidad)
      student.skills.forEach(skill => {
        const levelMap = {
          "beginner": 1,
          "intermediate": 2,
          "advanced": 3,
          "expert": 4
        };
        studentSkills[skill.name.toLowerCase()] = levelMap[skill.proficiencyLevel] || 1;
      });
    } else if (student.skills && typeof student.skills === 'object') {
      // Formato legacy: object con skill names como keys
      Object.assign(studentSkills, student.skills);
    }

    // Extraer skills de la oferta
    const offerSkills = {};
    if (offer.skills && offer.skills.length > 0) {
      offer.skills.forEach(skill => {
        // Usar nivel 2 como default para skills de oferta
        offerSkills[skill.name.toLowerCase()] = 2;
      });
    }

    // Extraer profamilyIds de la oferta
    const offerProfamilyIds = offer.profamilys ? offer.profamilys.map(p => p.id) : [];

    // Calcular afinidad usando el método existente
    const affinity = this.calculateAffinity(
      offerSkills,
      studentSkills,
      {
        profamilyId: student.profamilyId,
        offerProfamilyIds: offerProfamilyIds
      }
    );

    return {
      ...affinity,
      // Agregar información específica de la oferta para el estudiante
      offerInfo: {
        id: offer.id,
        name: offer.name,
        company: offer.company?.name,
        location: offer.location,
        mode: offer.mode,
        type: offer.type
      }
    };
  }
}

export default new AffinityCalculator();
