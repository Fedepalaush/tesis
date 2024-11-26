from datetime import datetime, timedelta

def validate_date_range(start_date, end_date, min_days=365):
    if (end_date - start_date).days < min_days:
        raise ValueError(f"The date range must be at least {min_days} days.")

def detectar_cruce(ema4_prev, ema9_prev, ema18_prev, ema4_curr, ema9_curr, ema18_curr):
    # Detectar cruce al alza
    if ema4_prev <= ema9_prev and ema4_prev <= ema18_prev and ema4_curr > ema9_curr and ema4_curr > ema18_curr:
        return 1  # Cruce al alza de EMA4 a EMA9 y EMA18
    # Detectar cruce a la baja
    elif ema4_prev >= ema9_prev and ema4_prev >= ema18_prev and ema4_curr < ema9_curr:
        return 2  # Cruce a la baja de EMA4 a EMA9
    return 0  # No hay cruce significativo
    
def evaluar_cruce(triple):
    tiene_uno = False
    tiene_dos = False

    for item in triple:
        valor = item.get('Cruce')
        if valor == 1:
            tiene_uno = True
        elif valor == 2:
            tiene_dos = True

    if tiene_dos and not tiene_uno:
        return 2
    elif tiene_uno:
        return 1
    else:
        return 0 