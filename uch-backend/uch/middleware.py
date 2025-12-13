import time

class DebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print(f'[MIDDLEWARE] Запрос: {request.path}')
        
        response = self.get_response(request)
        
        print(f'[MIDDLEWARE] Ответ: статус {response.status_code}, размер {len(getattr(response, "content", 0))} байт')
        print(f'[MIDDLEWARE] Тип ответа: {type(response).__name__}')
        
        # Если ответ пустой, попробуем добавить отладочную информацию
        if hasattr(response, 'content') and len(response.content) == 0:
            print(f'[MIDDLEWARE] ВНИМАНИЕ: Пустой ответ для {request.path}')
            
        return response
