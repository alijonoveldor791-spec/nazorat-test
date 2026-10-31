// Topshirish holatini butun sinf bo’yicha emas, har test kesimida hisoblaydi.
const normalize = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['‘ʼ]/g, '’')
    .replace(/\s+/g, ' ');
export function classProgress(cls, tests, results) {
  return tests.map((test) => {
    const rows = results.filter(
      (row) =>
        row.testId === test.id && (row.classId === cls.id || normalize(row.grade) === normalize(cls.name))
    );
    const missing = cls.students.filter(
      (student) =>
        !rows.some((row) =>
          row.studentId
            ? row.studentId === student.id
            : normalize(row.surname + ' ' + row.name) === normalize(student.surname + ' ' + student.name)
        )
    );
    return { test, submitted: cls.students.length - missing.length, missing };
  });
}
