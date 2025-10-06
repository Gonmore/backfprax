import { Skill } from '../models/skill.js';

export async function listSkills(req, res) {
  const skills = await Skill.findAll();
  res.json({ success: true, data: skills });
}

export async function createSkill(req, res) {
  const { name, category } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const [skill, created] = await Skill.findOrCreate({ where: { name }, defaults: { category } });
    res.status(created ? 201 : 200).json(skill);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear skill', details: err.message });
  }
}
