export const colors = {
  bgDefault: '#FFFFFF',                
  textDefault: '#1E1E1E',               
  textTertiary: '#B3B3B3',              
  brandOnBrand: '#F5F5F5',              
  primary: '#5903C3',                 
  borderDefault: '#D9D9D9',
  borderBrand: '#2C2C2C',
  black: '#000000',
};

export const spacing = (n = 1) => 8 * n; // 8-pt grid
export const radii = { sm: 8, md: 8, lg: 12 };
export const type = {
  label:   { fontSize: 16, lineHeight: 22.4, fontWeight: '400' as const },
  input:   { fontSize: 16, lineHeight: 16,   fontWeight: '400' as const },
  btn:     { fontSize: 16, lineHeight: 16,   fontWeight: '600' as const },
  h1:      { fontSize: 48, lineHeight: 57.6, fontWeight: '700' as const },
  h2:      { fontSize: 23, lineHeight: 32.2, fontWeight: '400' as const },
};
