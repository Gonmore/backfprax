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

    // 🔥 NUEVO: Calcular afinidad de familia profesional PRIMERO (ahora es BONUS, no base)
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
      // 🔥 NUEVO: Si no hay skills requeridos, score basado SOLO en profamily (0-1 scale)
      const profamilyScore = profamilyAffinity.points / 50; // 0-1 scale (máximo 1.0)

      // 🔥 Crear factors con información de profamily para el breakdown
      const factors = {
        profamilyAffinity,
        skillPoints: 0,
        profamilyPoints: profamilyAffinity.points,
        skillWeight: 0.5,
        profamilyWeight: 0.5,
        totalMaxPoints: 100
      };

      return this._createAffinityResult(profamilyScore, 0, 0, [], factors);
    }

    // 🔥 NUEVO ALGORITMO: SKILLS SON EL FACTOR PRINCIPAL (70-80% del score)
    // La profamily es ahora un BONUS adicional (20-30% del score)

    //  OPTIMIZACIÓN: Pre-clasificar habilidades por importancia
    const skillsByImportance = this._classifySkillsByImportance(companySkills);

    // 🔥 CALCULAR SCORE PRINCIPAL BASADO EN SKILLS
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

        // 🔥 NUEVO: Sistema de puntuación más sofisticado y PESADO para skills
        let skillScore = this._calculateSkillScore(skillMatch);

        // Aplicar bonificaciones especiales (más agresivas)
        if (companyLevel >= 4) {
          hasPremiumMatch = true;
          criticalSkillsMatched++;
          skillScore *= this.weights.criticalSkill; // 1.5x
        }

        if (companyLevel === 2) hasValue2Match++;

        if (studentLevel > companyLevel) {
          hasSuperiorRating++;
          skillScore *= this.weights.superiorMatch; // 1.3x
        }

        // 🔥 NUEVO: Bonus por consistencia en habilidades importantes (más agresivo)
        if (companyLevel >= 3 && studentLevel >= companyLevel) {
          consistencyScore += 2; // Duplicado
        }

        score += skillScore;
      } else {
        // 🔥 NUEVO: Penalización más agresiva para habilidades faltantes
        const missingPenalty = this._calculateMissingSkillPenalty(companyLevel, totalCompanySkills);
        score -= missingPenalty * 1.5; // Penalización 50% más agresiva
      }
    }

    // 🔥 NUEVO: Factor de cobertura más importante
    coverageFactor = matches / totalCompanySkills;

    // Factor proporcional mejorado (más agresivo)
    if (totalStudentSkills > totalCompanySkills) {
      const skillRatio = totalStudentSkills / totalCompanySkills;
      proportionalFactor = Math.min(1.4, 1 + (coverageFactor * 0.4)); // Máximo 1.4x
    }

    // 🔥 NUEVO: Detección mejorada de coincidencia única especial (más agresiva)
    if (matches === 1 && totalCompanySkills === 1) {
      const singleSkill = matchingSkills[0];
      if (singleSkill.companyLevel >= 4 && singleSkill.studentLevel >= singleSkill.companyLevel) {
        specialUniqueMatch = true;
        score = Math.min(score * 2.0, this.maxScoreUniqueMatch * 1.5); // Hasta 4.5
      }
    }

    // 🔥 NUEVO ALGORITMO: PROFAMILY 50% + SKILLS 50%
    // Calcular score de profamily (0-50 puntos convertidos a 0-1)
    const profamilyScore = profamilyAffinity.points / 50; // 0-1 scale

    // Calcular score de skills (0-50 puntos convertidos a 0-1)
    const skillPoints = this._calculateSkillPoints(companySkills, studentSkills, matches, matchingSkills);
    const skillScore = skillPoints / 50; // 0-1 scale

    // 🔥 COMBINACIÓN FINAL: 50% profamily + 50% skills
    const finalScore = (profamilyScore * 0.5) + (skillScore * 0.5);

    // 🔥 NUEVO: Asegurar que el score mínimo sea razonable si hay alguna coincidencia
    let normalizedScore;
    if (matches > 0 && finalScore < 0.1) {
      normalizedScore = Math.max(finalScore, 0.1 + (matches * 0.02));
    } else {
      normalizedScore = finalScore;
    }

    // 🔥 NUEVO: Normalización más inteligente
    normalizedScore = Math.min(1.0, normalizedScore); // Máximo 1.0 (100 puntos totales)

    // 🔥 INTEGRACIÓN: Factores expandidos
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
      skillPoints: skillPoints,
      profamilyPoints: profamilyAffinity.points,
      skillWeight: 0.5,
      profamilyWeight: 0.5,
      totalMaxPoints: 100
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
    // Normalización mejorada que considera la cobertura para escala 0-1
    const baseNormalization = (score / 1.0) * 0.8; // Base 80% del score
    const coverageAdjustment = Math.log(1 + coverageFactor) / Math.log(2) * 0.2; // 20% adicional por cobertura

    return Math.min(1.0, baseNormalization + coverageAdjustment);
  }

  //  MÉTODO NUEVO: Crear resultado con nivel y explicación
  _createAffinityResult(score, matches, totalRequired, matchingSkills, factors) {
    const roundedScore = Math.round(score * 100) / 100;
    const coverage = Math.round((matches / totalRequired) * 100);

    //  CONVERTIR SCORE A NIVEL
    const level = this._scoreToLevel(roundedScore, coverage);

    //  GENERAR EXPLICACIÓN LEGIBLE
    const explanation = this._generateExplanation(roundedScore, matches, totalRequired, coverage, level, factors);

    return {
      score: roundedScore,
      level,
      matches,
      coverage,
      totalRequired,
      coveragePercentage: coverage,
      matchingSkills,
      explanation,
      factors,
      // 🔥 NUEVO: Información detallada de puntos
      pointsBreakdown: {
        profamilyPoints: factors.profamilyPoints || 0,
        skillPoints: factors.skillPoints || 0,
        totalPoints: (factors.profamilyPoints || 0) + (factors.skillPoints || 0),
        maxTotalPoints: 100
      }
    };
  }

  //  OPTIMIZACIÓN: Algoritmo de nivel mejorado con rangos específicos (nunca "sin datos")
  _scoreToLevel(score, coverage) {
    // Convertir score 0-1 a porcentaje 0-100
    const percentage = Math.round(score * 100);

    // Rangos específicos del usuario (nunca "sin datos")
    if (percentage >= 81) return "muy alto";
    if (percentage >= 61) return "alto";
    if (percentage >= 31) return "medio";
    return "bajo"; // 0-30 siempre será "bajo"
  }

  //  OPTIMIZACIÓN: Explicaciones más detalladas y útiles
  _generateExplanation(score, matches, totalRequired, coverage, level, factors) {
    if (matches === 0) {
      return "No se encontraron coincidencias en las habilidades requeridas. Considere ampliar los criterios de búsqueda.";
    }

    const profamilyPoints = factors.profamilyPoints || 0;
    const skillPoints = factors.skillPoints || 0;
    const totalPoints = profamilyPoints + skillPoints;

    const baseInfo = `${matches}/${totalRequired} habilidades coincidentes (${coverage}% cobertura)`;
    const pointsInfo = `Puntuación: ${totalPoints}/100 puntos (${profamilyPoints} profamily + ${skillPoints} skills)`;

    const explanations = {
      "muy alto": ` ${baseInfo}. Candidato excepcional con excelente afinidad para el puesto. ${pointsInfo}. Altamente recomendado para entrevista inmediata.`,
      "alto": ` ${baseInfo}. Candidato sólido con buena afinidad. ${pointsInfo}. Recomendado para proceso de selección.`,
      "medio": ` ${baseInfo}. Candidato con potencial moderado. ${pointsInfo}. Revisar experiencia específica y considerar entrevista.`,
      "bajo": ` ${baseInfo}. Afinidad limitada. ${pointsInfo}. Evaluar si el candidato puede desarrollar habilidades faltantes.`,
      "sin datos": "No se encontraron datos suficientes para evaluar la afinidad. Revisar perfil del candidato."
    };

    return explanations[level] || `${baseInfo}. ${pointsInfo}. Puntuación: ${(score * 100).toFixed(1)}/100`;
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
   *  NUEVO: Calcular afinidad basada en familia profesional con reglas específicas
   *  VERIFICADO IGUAL: 50 puntos
   *  VERIFICADO AFÍN: 30 puntos
   *  NO VERIFICADO IGUAL: 25 puntos
   *  NO VERIFICADO AFÍN: 15 puntos
   */
  _calculateProfamilyAffinity(profamilyId, offerProfamilyIds, studentVerificationStatus = 'unverified') {
    if (!profamilyId) {
      return { score: 0, level: "none", details: "Sin familia profesional definida", points: 0 };
    }

    if (!offerProfamilyIds || offerProfamilyIds.length === 0) {
      return { score: 0, level: "neutral", details: "Oferta sin familias profesionales especificadas", points: 0 };
    }

    const isVerified = studentVerificationStatus === 'verified';
    const exactMatch = offerProfamilyIds.includes(profamilyId);

    let points = 0;
    let level = "";
    let details = "";

    if (exactMatch) {
      // Coincidencia EXACTA
      if (isVerified) {
        points = 50; // Información verificada IGUAL
        level = "exact_verified";
        details = "Familia profesional verificada coincide exactamente";
      } else {
        points = 25; // Información NO verificada IGUAL
        level = "exact_unverified";
        details = "Familia profesional no verificada coincide exactamente";
      }
    } else {
      // 🔥 CORRECCIÓN: Solo dar puntos por AFÍN si realmente hay relación
      // Por ahora, si no hay coincidencia exacta, 0 puntos
      // TODO: Implementar lógica real para detectar profamilys relacionadas/afines
      points = 0; // No hay coincidencia
      level = "no_match";
      details = "Familia profesional no coincide con la oferta";
    }

    // Convertir puntos a score (0-1) para compatibilidad con el algoritmo existente
    const score = points / 50; // Máximo 50 puntos = score 1.0

    return {
      score: score,
      level: level,
      details: details,
      points: points,
      maxPoints: 50
    };
  }

  /**
   *  NUEVO: Calcular puntos de skills (0-50) según reglas específicas
   *  Máximo 5 skills IGUALES con dominio ALTO = 50 puntos
   *  Redistribuir según coincidencias y nivel de dominio
   */
  _calculateSkillPoints(offerSkills, studentSkills, totalMatches, matchingSkills) {
    if (totalMatches === 0) return 0;

    // Contar skills con diferentes niveles de coincidencia
    let exactHighLevel = 0; // Skills exactas con nivel alto (3)
    let exactMediumLevel = 0; // Skills exactas con nivel medio (2)
    let exactLowLevel = 0; // Skills exactas con nivel bajo (1)
    let superiorMatches = 0; // Skills donde estudiante supera el nivel requerido

    matchingSkills.forEach(match => {
      const studentLevel = match.studentLevel;
      const companyLevel = match.companyLevel;

      if (studentLevel >= companyLevel) {
        // Coincidencia exacta o superior
        if (studentLevel >= 3) {
          exactHighLevel++;
        } else if (studentLevel >= 2) {
          exactMediumLevel++;
        } else {
          exactLowLevel++;
        }

        if (studentLevel > companyLevel) {
          superiorMatches++;
        }
      }
    });

    // 🔥 SISTEMA DE PUNTUACIÓN: Máximo 50 puntos para 5+ skills con nivel alto
    let skillPoints = 0;

    // Base: 10 puntos por cada skill con nivel alto (máximo 5 skills = 50 puntos)
    const highLevelPoints = Math.min(exactHighLevel, 5) * 10;
    skillPoints += highLevelPoints;

    // Bonus adicional por skills de nivel alto extras (más de 5)
    if (exactHighLevel > 5) {
      const extraHighSkills = exactHighLevel - 5;
      skillPoints += extraHighSkills * 5; // 5 puntos cada una adicional
    }

    // Bonus por skills de nivel medio (4 puntos cada una)
    skillPoints += exactMediumLevel * 4;

    // Bonus por skills de nivel bajo (2 puntos cada una)
    skillPoints += exactLowLevel * 2;

    // Bonus por superar el nivel requerido (2 puntos cada una)
    skillPoints += superiorMatches * 2;

    // 🔥 NUEVO: Factor de cobertura para premiar coincidencias completas
    const totalRequiredSkills = Object.keys(offerSkills).length;
    const coverageFactor = totalMatches / totalRequiredSkills;

    if (coverageFactor >= 0.8) {
      skillPoints *= 1.1; // +10% por cobertura alta
    } else if (coverageFactor >= 0.6) {
      skillPoints *= 1.05; // +5% por cobertura media
    }

    // 🔥 NUEVO: Penalización por skills faltantes críticas
    const missingSkills = totalRequiredSkills - totalMatches;
    if (missingSkills > 0) {
      const penaltyFactor = Math.max(0.7, 1 - (missingSkills * 0.1)); // Máxima penalización 30%
      skillPoints *= penaltyFactor;
    }

    // Asegurar máximo 50 puntos
    return Math.min(50, Math.round(skillPoints));
  }
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
